let baseurl = 'http://localhost:8081';

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

/**
 * 递归加载树结构
 * @param parentData
 * @param data
 */
function tree(parentData, data) {
  parentData.sort((a, b) => a.seq - b.seq);
  parentData.forEach(parentDept => {
    parentDept.children = [];
    data.forEach(dept => {
      if (dept.pid == parentDept.id) {
        parentDept.children.push(dept);
      }
    });
    if(parentDept.children){
      this.tree(parentDept.children, data);
    }
  })
  return parentData;
}

export default {
  baseurl, formatObj, tree
}
