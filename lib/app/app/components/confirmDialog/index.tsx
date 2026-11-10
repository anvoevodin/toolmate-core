import './style.scss'
import { AlertDialog } from '@kobalte/core'
import { Component, JSX } from 'solid-js'

export type ConfirmDialogProps = {
	open: boolean
	title: string
	confirmLabel?: string
	cancelLabel?: string
	onConfirm: () => void
	onCancel: () => void
	children?: JSX.Element
}

/** Modal confirmation. Enter confirms, Esc cancels. */
export const ConfirmDialog: Component<ConfirmDialogProps> = (props) => {
	let confirmButton: HTMLButtonElement | undefined
	let cancelButton: HTMLButtonElement | undefined

	return (
		<AlertDialog.Root
			open={props.open}
			onOpenChange={(isOpen) => {
				if (!isOpen) props.onCancel() // Esc.
			}}
		>
			<AlertDialog.Portal>
				<AlertDialog.Overlay class="toolmate-dialog-overlay" />
				<div class="toolmate-dialog-positioner">
					<AlertDialog.Content
						class="toolmate-dialog"
						onOpenAutoFocus={(e) => {
							e.preventDefault()
							confirmButton?.focus()
						}}
						onKeyDown={(e) => {
							if (e.key !== 'Enter' || e.target === cancelButton) return
							e.preventDefault()
							props.onConfirm()
						}}
					>
						<AlertDialog.Title class="toolmate-dialog-title">{props.title}</AlertDialog.Title>
						<AlertDialog.Description class="toolmate-dialog-description">
							{props.children}
						</AlertDialog.Description>
						<div class="toolmate-dialog-buttons">
							<button ref={cancelButton} onClick={() => props.onCancel()}>
								{props.cancelLabel ?? 'Cancel'}
							</button>
							<button ref={confirmButton} class="selected" onClick={() => props.onConfirm()}>
								{props.confirmLabel ?? 'OK'}
							</button>
						</div>
					</AlertDialog.Content>
				</div>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	)
}
