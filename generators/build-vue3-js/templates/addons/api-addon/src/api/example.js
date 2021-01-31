import request from "@/utils/request";

export function getList(params) {
  return request({
    url: "/example/list",
    method: "get",
    params,
  });
}
