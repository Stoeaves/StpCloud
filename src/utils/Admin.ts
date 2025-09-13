import request from "./Request";

async function checkPassword(password: string) {
  return request.post<{ code: number }>("/admin/login", {
    adminPass: password,
  });
}

export default checkPassword;
