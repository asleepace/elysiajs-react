export type AuthorProps = {
  name: string
}

export function AuthorName(props: AuthorProps) {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      Author: {props.name}
    </div>
  )
}
