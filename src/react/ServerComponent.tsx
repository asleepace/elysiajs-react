'use server'

import { Suspense } from 'react'
import { HTMLContainer } from './HTMLContainer'
import { AuthorName } from './AuthorName'

export async function ServerComponent() {
  return (
    <HTMLContainer title="Server Component">
      <Suspense fallback={<div>Loading...</div>}>
        <AuthorName />
      </Suspense>
    </HTMLContainer>
  )
}
