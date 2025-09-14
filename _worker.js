export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    const method = request.method;
    const contentType = request.headers.get('content-type');

    // 文件列表
    if (pathname === '/list') return handle.fileList(request, env);
    // 文件夹列表
    if (pathname === '/folderList') return handle.folderList(request, env);
    // 文件信息
    if (pathname === '/fileInfo' && method === 'POST') return handle.fileInfo(request, env, '', true);
    // 文件下载
    if (pathname === '/download' && method === 'POST') return handle.download(request, env);
    // 管理员
    if (pathname.startsWith('/admin') && method === 'POST') {
      var data;

      if (contentType?.includes('multipart/form-data')) data = await request.formData();
      else data = await request.json();

      const admin = handle.admin(data, env);
      if (admin === 401)
        return returns({
          code: 401,
          message: 'Unauthorized',
        });

      const action = pathname.substr('/admin/'.length);

      // 登录
      if (action === 'login') return admin.login(data, env);
      // 申请上传资格
      if (action === 'applyToken') return admin.applyToken(data, request, env);
      // 上传
      if (action === 'upload') return admin.upload(data, request, env);
      // 创建文件夹
      if (action === 'createFolder') return admin.createFolder(data, request, env);
    }

    //

    return returns({
      code: 404,
      message: 'Not Found',
    });
  },
};

/**
 * 便携返回
 */
const returns = (json) => {
  return new Response(JSON.stringify(json), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};

/**
 * 获取Github API基础路径
 */
function getBaseURL(env) {
  return `https://api.github.com/repos/${env.REPO_OWNER}/${env.REPO_NAME}/contents`;
}

/**
 * 检查管理员密码
 */
function checkAdminPass(adminPass, env) {
  return adminPass === env.ADMIN_PASS ? true : false;
}

/**
 * 获取Github API 的请求头
 */
function getHeader(env) {
  const headers = new Headers();
  headers.append('Authorization', 'Bearer ' + env.GITHUB_TOKEN);
  headers.append('User-Agent', 'StpCloud-Service');
  return headers;
}

/**
 * 获取指定路径的文件列表
 */
async function getListContent(path, env) {
  const res = await fetch(`${getBaseURL(env)}${path}`, {
    headers: getHeader(env),
  });

  if (!res.ok)
    return returns({
      code: 500,
      message: 'Internal Server Error',
    });

  const data = await res.json();
  return data;
}

/**
 * 为对象添加 get 方法
 */
Object.prototype.get = function (key) {
  return this[key];
};

/**
 * 将字符串转换为 Base64 编码
 * @param {string} str - 要转换的字符串
 * @return {string} - 返回 Base64 编码的字符串
 */
const base64 = (str) => {
  const utf8Bytes = new TextEncoder().encode(str);
  return btoa(String.fromCharCode.apply(null, utf8Bytes));
};

/**
 * 将 Blob 转换为 Base64
 * @param {Blob} blob - 要转换的 Blob 对象
 * @return {Promise<string>} - 返回 Base64 编码的字符串
 */
async function blobToBase64(blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const uintArray = new Uint8Array(arrayBuffer);

  const chunkSize = 32768; // 32KB 安全块大小
  let binaryString = '';

  for (let i = 0; i < uintArray.length; i += chunkSize) {
    const chunk = uintArray.subarray(i, Math.min(i + chunkSize, uintArray.length));
    binaryString += String.fromCharCode.apply(null, chunk);
  }

  return btoa(binaryString);
}

const handle = {
  // 文件列表
  fileList: async function (request, env) {
    const method = request.method;
    const { searchParams } = new URL(request.url);

    const data = method === 'GET' ? searchParams : await request.json();
    const path = data.get('path') ?? '/';

    if (path !== '/') {
      const folderInfo = await this.fileInfo(request, env, path.split('/').pop());
      if (folderInfo.permission === 'private') {
        if (method !== 'POST')
          return returns({
            code: 403,
            message: 'Forbidden',
          });

        const adminPass = data['adminPass'];
        const folderPwd = md5(data['folderPass']);
        const folderPass = await env.KV.get(`folder_${folderInfo.id}_pass`);
        if (folderPwd !== folderPass && !checkAdminPass(adminPass, env))
          return returns({
            code: 403,
            message: 'Forbidden',
          });
      }
    }

    const list = await getListContent(path, env);
    // 过滤
    const files = [];
    const filesList = list.filter((item) => item.type === 'dir' && !item.name.includes('folder-'));
    for (let i = 0; i < filesList.length; i++) {
      const fileInf = await this.fileInfo(request, env, `${filesList[i].name}`);
      files.push({
        name: fileInf.name,
        type: fileInf.type,
        sha: filesList[i].name,
        size: fileInf.size,
        date: fileInf.date,
        chunks: fileInf.chunks,
      });
    }

    return returns(files);
  },

  // 文件夹列表
  folderList: async function (request, env) {
    const data = await getListContent('/', env);
    const folders = [];
    const foldersList = data.filter((item) => item.name.includes('folder-'));
    for (let i = 0; i < foldersList.length; i++) {
      const folderInfo = await this.fileInfo(request, env, `${foldersList[i].name}`);
      folders.push({
        name: folderInfo.name,
        id: folderInfo.id,
        permission: folderInfo.permission,
      });
    }

    return returns(folders);
  },

  // 文件信息
  fileInfo: async function (request, env, fileName = '', isReturnResponse = false) {
    if (!fileName) {
      const data = await request.json();
      fileName = data.get('fileName');
    }

    const res = await fetch(
      `https://raw.githubusercontent.com/${env.REPO_OWNER}/${env.REPO_NAME}/${env.REPO_BRANCH}/${fileName}/info.json`,
      { headers: getHeader(env) },
    );
    if (res.status === 404)
      return returns({
        code: 404,
        message: '未找到目标文件信息',
      });

    const json = await res.json();
    return isReturnResponse ? returns(json) : json;
  },

  // 文件下载
  download: async function (request, env) {
    const data = await request.json();
    const sha = data.get('sha');
    const index = data.get('index');

    const res = await fetch(
      `https://raw.githubusercontent.com/${env.REPO_OWNER}/${env.REPO_NAME}/${env.REPO_BRANCH}/${sha}/${index}`,
      { headers: getHeader(env) },
    );

    if (!res.ok)
      return returns({
        code: 500,
        message: 'Internal Server Error',
      });

    return new Response(res.body, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE',
      },
    });
  },

  // 管理员
  admin: function (data, env) {
    const adminPass = data.get('adminPass');
    const checkPass = checkAdminPass(adminPass, env);
    if (!checkPass) return 401;

    return {
      // 登录
      login: async function (data, env) {
        const pass = data.get('adminPass');
        const checkPass = checkAdminPass(pass, env);
        let code = 401;
        if (checkPass) code = 200;

        return returns({ code });
      },
      // 申请上传资格
      applyToken: async function (data, request, env) {
        const name = data.get('name');
        const type = data.get('type');
        const date = data.get('date');
        const size = data.get('size');
        const sha = data.get('sha');

        // 判断文件是否已存在
        const list = await getListContent('', env);
        const isExisted = list.filter((item) => item.name === sha);
        if (isExisted.length > 0)
          return returns({
            code: 201,
            message: '文件已存在',
          });

        const fileInfo = {
          name,
          type,
          date,
          size,
        };

        // 上传文件信息
        const res = await fetch(`${getBaseURL(env)}/${sha}/info.json`, {
          method: 'PUT',
          headers: getHeader(env),
          body: JSON.stringify({
            branch: env.REPO_BRANCH,
            message: `Create info.json for ${sha}`,
            content: base64(JSON.stringify(fileInfo)),
          }),
        });

        if (!res.ok) {
          const error = await res.json();
          return returns({
            code: 500,
            message: `GitHub error: ${error.message}`,
          });
        }

        return returns({ code: 200 });
      },
      // 上传
      upload: async function (data, request, env) {
        const sha = data.get('sha');
        const index = data.get('index');
        const chunk = data.get('chunk');

        // 将Blob转Base64
        const base64 = await blobToBase64(chunk);
        const res = await fetch(`${getBaseURL(env)}/${sha}/${index}`, {
          method: 'PUT',
          headers: getHeader(env),
          body: JSON.stringify({
            branch: env.REPO_BRANCH,
            message: `Upload chunk ${index} for ${sha}`,
            content: base64,
          }),
        });

        if (!res.ok) {
          const error = await res.json();
          return returns({
            code: 400,
            message: `GitHub error: ${error.message}`,
          });
        }

        return returns({ success: true });
      },
      // 创建文件夹
      createFolder: async function (data, request, env) {
        const name = data.get('name');
        const id = Date.parse(new Date());
        const permission = data.get('permission');

        if (permission === 'private') {
          const folderPass = data.get('folderPass');
          await env.KV.put(`folder_${id}_pass`, md5(folderPass));
        }

        const info = {
          name,
          id,
          permission,
        };

        const res = await fetch(`${getBaseURL(env)}/folder-${id}/info.json`, {
          method: 'PUT',
          headers: getHeader(env),
          body: JSON.stringify({
            branch: env.REPO_BRANCH,
            message: `Create folder ${name} info.json`,
            content: base64(JSON.stringify(info)),
          }),
        });

        if (!res.ok) {
          const error = await res.json();
          return returns({
            code: 500,
            message: `GitHub error: ${error.message}`,
          });
        }

        return returns({ code: 200 });
      },
    };
  },
};

// <!------------------ MD5 ------------------!>
function md5(string) {
  function md5_RotateLeft(lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function md5_AddUnsigned(lX, lY) {
    var lX4, lY4, lX8, lY8, lResult;
    lX8 = lX & 0x80000000; //2147483648
    lY8 = lY & 0x80000000; //2147483648
    lX4 = lX & 0x40000000; //1073741824
    lY4 = lY & 0x40000000; //1073741824
    lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) {
      return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    }
    if (lX4 | lY4) {
      if (lResult & 0x40000000) {
        return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      } else {
        return lResult ^ 0x40000000 ^ lX8 ^ lY8;
      }
    } else {
      return lResult ^ lX8 ^ lY8;
    }
  }
  function md5_F(x, y, z) {
    return (x & y) | (~x & z);
  }
  function md5_G(x, y, z) {
    return (x & z) | (y & ~z);
  }
  function md5_H(x, y, z) {
    return x ^ y ^ z;
  }
  function md5_I(x, y, z) {
    return y ^ (x | ~z);
  }
  function md5_FF(a, b, c, d, x, s, ac) {
    a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_F(b, c, d), x), ac));
    return md5_AddUnsigned(md5_RotateLeft(a, s), b);
  }
  function md5_GG(a, b, c, d, x, s, ac) {
    a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_G(b, c, d), x), ac));
    return md5_AddUnsigned(md5_RotateLeft(a, s), b);
  }
  function md5_HH(a, b, c, d, x, s, ac) {
    a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_H(b, c, d), x), ac));
    return md5_AddUnsigned(md5_RotateLeft(a, s), b);
  }
  function md5_II(a, b, c, d, x, s, ac) {
    a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_I(b, c, d), x), ac));
    return md5_AddUnsigned(md5_RotateLeft(a, s), b);
  }
  function md5_ConvertToWordArray(string) {
    var lWordCount;
    var lMessageLength = string.length;
    var lNumberOfWords_temp1 = lMessageLength + 8;
    var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    var lWordArray = Array(lNumberOfWords - 1);
    var lBytePosition = 0;
    var lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition);
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }
  function md5_WordToHex(lValue) {
    var WordToHexValue = '',
      WordToHexValue_temp = '',
      lByte,
      lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValue_temp = '0' + lByte.toString(16);
      WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
    }
    return WordToHexValue;
  }
  function md5_Utf8Encode(string) {
    string = string.replace(/\r\n/g, '\n');
    var utftext = '';
    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  }
  var x = Array();
  var k, AA, BB, CC, DD, a, b, c, d;
  var S11 = 7,
    S12 = 12,
    S13 = 17,
    S14 = 22;
  var S21 = 5,
    S22 = 9,
    S23 = 14,
    S24 = 20;
  var S31 = 4,
    S32 = 11,
    S33 = 16,
    S34 = 23;
  var S41 = 6,
    S42 = 10,
    S43 = 15,
    S44 = 21;
  string = md5_Utf8Encode(string);
  x = md5_ConvertToWordArray(string);
  a = 0x67452301; //1732584193
  b = 0xefcdab89; //4023233417
  c = 0x98badcfe; //2562383102
  d = 0x10325476; //271733878
  for (k = 0; k < x.length; k += 16) {
    AA = a;
    BB = b;
    CC = c;
    DD = d;
    a = md5_FF(a, b, c, d, x[k + 0], S11, 0xd76aa478);
    d = md5_FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
    c = md5_FF(c, d, a, b, x[k + 2], S13, 0x242070db);
    b = md5_FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
    a = md5_FF(a, b, c, d, x[k + 4], S11, 0xf57c0faf);
    d = md5_FF(d, a, b, c, x[k + 5], S12, 0x4787c62a);
    c = md5_FF(c, d, a, b, x[k + 6], S13, 0xa8304613);
    b = md5_FF(b, c, d, a, x[k + 7], S14, 0xfd469501);
    a = md5_FF(a, b, c, d, x[k + 8], S11, 0x698098d8);
    d = md5_FF(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
    c = md5_FF(c, d, a, b, x[k + 10], S13, 0xffff5bb1);
    b = md5_FF(b, c, d, a, x[k + 11], S14, 0x895cd7be);
    a = md5_FF(a, b, c, d, x[k + 12], S11, 0x6b901122);
    d = md5_FF(d, a, b, c, x[k + 13], S12, 0xfd987193);
    c = md5_FF(c, d, a, b, x[k + 14], S13, 0xa679438e);
    b = md5_FF(b, c, d, a, x[k + 15], S14, 0x49b40821);
    a = md5_GG(a, b, c, d, x[k + 1], S21, 0xf61e2562);
    d = md5_GG(d, a, b, c, x[k + 6], S22, 0xc040b340);
    c = md5_GG(c, d, a, b, x[k + 11], S23, 0x265e5a51);
    b = md5_GG(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa);
    a = md5_GG(a, b, c, d, x[k + 5], S21, 0xd62f105d);
    d = md5_GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = md5_GG(c, d, a, b, x[k + 15], S23, 0xd8a1e681);
    b = md5_GG(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
    a = md5_GG(a, b, c, d, x[k + 9], S21, 0x21e1cde6);
    d = md5_GG(d, a, b, c, x[k + 14], S22, 0xc33707d6);
    c = md5_GG(c, d, a, b, x[k + 3], S23, 0xf4d50d87);
    b = md5_GG(b, c, d, a, x[k + 8], S24, 0x455a14ed);
    a = md5_GG(a, b, c, d, x[k + 13], S21, 0xa9e3e905);
    d = md5_GG(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
    c = md5_GG(c, d, a, b, x[k + 7], S23, 0x676f02d9);
    b = md5_GG(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);
    a = md5_HH(a, b, c, d, x[k + 5], S31, 0xfffa3942);
    d = md5_HH(d, a, b, c, x[k + 8], S32, 0x8771f681);
    c = md5_HH(c, d, a, b, x[k + 11], S33, 0x6d9d6122);
    b = md5_HH(b, c, d, a, x[k + 14], S34, 0xfde5380c);
    a = md5_HH(a, b, c, d, x[k + 1], S31, 0xa4beea44);
    d = md5_HH(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
    c = md5_HH(c, d, a, b, x[k + 7], S33, 0xf6bb4b60);
    b = md5_HH(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
    a = md5_HH(a, b, c, d, x[k + 13], S31, 0x289b7ec6);
    d = md5_HH(d, a, b, c, x[k + 0], S32, 0xeaa127fa);
    c = md5_HH(c, d, a, b, x[k + 3], S33, 0xd4ef3085);
    b = md5_HH(b, c, d, a, x[k + 6], S34, 0x4881d05);
    a = md5_HH(a, b, c, d, x[k + 9], S31, 0xd9d4d039);
    d = md5_HH(d, a, b, c, x[k + 12], S32, 0xe6db99e5);
    c = md5_HH(c, d, a, b, x[k + 15], S33, 0x1fa27cf8);
    b = md5_HH(b, c, d, a, x[k + 2], S34, 0xc4ac5665);
    a = md5_II(a, b, c, d, x[k + 0], S41, 0xf4292244);
    d = md5_II(d, a, b, c, x[k + 7], S42, 0x432aff97);
    c = md5_II(c, d, a, b, x[k + 14], S43, 0xab9423a7);
    b = md5_II(b, c, d, a, x[k + 5], S44, 0xfc93a039);
    a = md5_II(a, b, c, d, x[k + 12], S41, 0x655b59c3);
    d = md5_II(d, a, b, c, x[k + 3], S42, 0x8f0ccc92);
    c = md5_II(c, d, a, b, x[k + 10], S43, 0xffeff47d);
    b = md5_II(b, c, d, a, x[k + 1], S44, 0x85845dd1);
    a = md5_II(a, b, c, d, x[k + 8], S41, 0x6fa87e4f);
    d = md5_II(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0);
    c = md5_II(c, d, a, b, x[k + 6], S43, 0xa3014314);
    b = md5_II(b, c, d, a, x[k + 13], S44, 0x4e0811a1);
    a = md5_II(a, b, c, d, x[k + 4], S41, 0xf7537e82);
    d = md5_II(d, a, b, c, x[k + 11], S42, 0xbd3af235);
    c = md5_II(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb);
    b = md5_II(b, c, d, a, x[k + 9], S44, 0xeb86d391);
    a = md5_AddUnsigned(a, AA);
    b = md5_AddUnsigned(b, BB);
    c = md5_AddUnsigned(c, CC);
    d = md5_AddUnsigned(d, DD);
  }
  return (md5_WordToHex(a) + md5_WordToHex(b) + md5_WordToHex(c) + md5_WordToHex(d)).toLowerCase();
}
