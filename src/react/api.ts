export namespace api {
  export async function fetchUser() {
    return fetch('http://localhost:3000/author/asleepace', { method: 'GET' })
      .then((res) => res.json())
      .then((data) => {
        return data as { name: string }
      })
      .catch((error) => {
        console.error(error)
        return { name: 'error' }
      })
  }
}
