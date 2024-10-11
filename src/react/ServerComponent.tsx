import { Suspense } from 'react'
import HTMLContainer from './HTMLContainer'
import { AuthorName } from './AuthorName'
import { api } from './api'

export default async function ServerComponent() {
  console.log('[ServerComponent] mounting...')
  const user = await api.fetchUser()

  return (
    <HTMLContainer title="Server Component">
      <Suspense fallback={<p>Loading...</p>}>
        <AuthorName name={user.name} />
      </Suspense>
    </HTMLContainer>
  )
}
