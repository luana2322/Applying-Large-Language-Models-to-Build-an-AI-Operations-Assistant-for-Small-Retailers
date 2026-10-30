import React, { useState } from 'react'
import { Form, Input, InputNumber, Button, Alert, Card } from 'antd'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

interface DispatchFormValues {
  productId: number
  quantity: number
  note: string
}

export const StockDispatchForm: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const onFinish = async (values: DispatchFormValues) => {
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const response = await axios.post('/api/v1/inventory/stock-dispatches', values)
      if (response.status === 201 || response.status === 200) {
        setSuccessMsg('Tạo phiếu điều chuyển kho thành công!')
        form.resetFields()
        setTimeout(() => {
          navigate('/inventory')
        }, 500)
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setErrorMsg(err.response.data.message)
      } else {
        setErrorMsg('Không thể tạo phiếu điều chuyển kho. Vui lòng thử lại.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title="Tạo phiếu xuất điều chuyển kho" style={{ maxWidth: 600, margin: '20px auto' }}>
      {successMsg && (
        <Alert
          message={successMsg}
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
          data-testid="success-alert"
        />
      )}
      {errorMsg && (
        <Alert
          message={errorMsg}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          data-testid="error-alert"
        />
      )}

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Mã sản phẩm (Product ID)"
          name="productId"
          rules={[{ required: true, message: 'Vui lòng nhập mã sản phẩm' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="Nhập ID sản phẩm"
            data-testid="input-product-id"
          />
        </Form.Item>

        <Form.Item
          label="Số lượng xuất"
          name="quantity"
          rules={[
            { required: true, message: 'Vui lòng nhập số lượng' },
            {
              validator: (_, value) =>
                value > 0
                  ? Promise.resolve()
                  : Promise.reject(new Error('Số lượng xuất phải lớn hơn 0')),
            },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="Nhập số lượng xuất"
            data-testid="input-quantity"
          />
        </Form.Item>

        <Form.Item label="Ghi chú điều chuyển" name="note">
          <Input.TextArea placeholder="Lý do xuất kho..." data-testid="input-note" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            data-testid="submit-btn"
            style={{ marginRight: 8 }}
          >
            Xác nhận xuất kho
          </Button>
          <Button
            onClick={() => navigate('/inventory')}
            data-testid="cancel-btn"
          >
            Hủy bỏ
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}
