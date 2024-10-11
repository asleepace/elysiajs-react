export async function AuthorName() {
  'use server'

  const authorName = await fetch('/author/asleepace', { method: 'GET' })
    .then((res) => res.json())
    .then((data) => data.name)
    .catch((err) => {
      console.error(err)
      return 'error'
    })

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      Author: {authorName}
    </div>
  )
}
