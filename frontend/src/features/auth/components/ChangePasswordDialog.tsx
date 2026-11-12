import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { KeyRound, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { postChangePassword } from "../api/authApi"
import { ApiRequestError } from "@/lib/api/http"

interface ChangePasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPassword.trim()) {
      toast.error("Vui lòng nhập mật khẩu hiện tại")
      return
    }
    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không trùng khớp")
      return
    }

    try {
      setLoading(true)
      await postChangePassword({ currentPassword, newPassword })
      toast.success("Đổi mật khẩu thành công")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      onOpenChange(false)
    } catch (err) {
      if (err instanceof ApiRequestError) {
        toast.error(err.body.message || "Đổi mật khẩu thất bại")
      } else {
        toast.error("Lỗi kết nối khi đổi mật khẩu")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-50 p-2.5 text-blue-600">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Đổi mật khẩu</DialogTitle>
              <DialogDescription>
                Cập nhật mật khẩu để bảo mật tài khoản của bạn.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="current-pwd">Mật khẩu hiện tại</Label>
            <Input
              id="current-pwd"
              type="password"
              placeholder="Nhập mật khẩu hiện tại"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new-pwd">Mật khẩu mới</Label>
            <Input
              id="new-pwd"
              type="password"
              placeholder="Tối thiểu 6 ký tự"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-pwd">Xác nhận mật khẩu mới</Label>
            <Input
              id="confirm-pwd"
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

