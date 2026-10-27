import { AlertDialog } from '@base-ui/react/alert-dialog'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './button'

type ConfirmDialogProps = {
  open: boolean
  title: string
  children: ReactNode
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}

/** Asks before something that's hard to take back. The confirm button names the action, never "OK". */
export function ConfirmDialog({ open, title, children, confirmLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  const { t } = useTranslation()
  return (
    <AlertDialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 bg-print/55" />
        <AlertDialog.Popup className="sheet-paper fixed top-1/2 left-1/2 w-[min(24rem,calc(100vw-2rem))] -translate-1/2 rounded-[var(--radius-cell)] p-6 text-print shadow-sheet">
          <AlertDialog.Title className="called mb-3 text-4xl">{title}</AlertDialog.Title>
          <AlertDialog.Description render={<div />} className="text-print-soft">
            {children}
          </AlertDialog.Description>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <AlertDialog.Close render={<Button />}>{t('common.cancel')}</AlertDialog.Close>
            <Button look="plate" className="text-2xl" onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
