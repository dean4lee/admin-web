let baseurl = 'http://localhost:8080';

/**
 * 将对象中字段为""的值设置为null
 * @param obj
 */
function formatObj(obj) {
  if(!obj){
    return;
  }
  Object.keys(obj).forEach(key => {
    if(!obj[key]){
      obj[key] = null;
    }
  })
}

export default {
  baseurl, formatObj
}
