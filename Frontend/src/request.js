const request = (url, method = "GET", body = null) => {
  let options = {
    method: "",
    headers: {}
  };
  if (method) {
    options.method = method;
    if (method === "PUT") {
      options.body = body;
    } else if ((method === "POST" || method === "PATCH") && body) {
      options.body = JSON.stringify(body);
      options.headers["Content-Type"] = "application/json";
    }
  }
  return fetch("http://localhost:4000" + url, options).then(
    res => {
      if (res.status >= 200 && res.status <= 300) {
        return res.json();
      } else {
        alert(res.status + " " + res.statusText);
      }
    },
    rej => {
      throw rej;
    }
  );
};

const restInterface = {
  getLists() {
    return request('/lists')
  },
  getItems() {
    return request('/items')
  },
  addList(body) {
    return request('/lists', 'POST', body)
  },
  delList(listId) {
    return request(`/lists/${listId}`, 'DELETE')
  },
  addItem(body) {
    return request('/items', 'POST', body)
  },
  delItem(itemId) {
    return request(`/items/${itemId}`, 'DELETE')
  },
  editItem(itemId, body) {
    return request(`/items/${itemId}`, 'PATCH', body)
  }
}

class RestInterfaceClass {
  constructor(httpClient) {
    this.client = httpClient;
  }
  getLists() {
    return this.client('/lists')
  }
  getItems() {
    return this.client('/items')
  }
  addList(body) {
    return this.client('/lists', 'POST', body)
  }
  delList(listId) {
    return this.client(`/lists/${listId}`, 'DELETE')
  }
  addItem(body) {
    return this.client('/items', 'POST', body)
  }
  delItem(itemId) {
    return this.client(`/items/${itemId}`, 'DELETE')
  }
  editItem(itemId, body) {
    return this.client(`/items/${itemId}`, 'PATCH', body)
  }
}

// const apiClient = Object.create(restInterface);
const apiClient = new RestInterfaceClass(request)
// console.log('API CLIENTY', apiClient)
export { request, apiClient };