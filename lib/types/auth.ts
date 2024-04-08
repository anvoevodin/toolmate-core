export type Auth = {
	id: string
	title: string
	getAccessToken: (payload: unknown) => Promise<unknown>
}
