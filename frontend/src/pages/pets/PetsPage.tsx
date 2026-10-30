import React, { useEffect, useState } from 'react'
import { Card, Table, Tag, Button, Space, Modal, Form, Input, Select, InputNumber, DatePicker, message, Avatar } from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined, HeartOutlined } from '@ant-design/icons'
import axios from 'axios'
import dayjs from 'dayjs'

interface Pet {
  id: number
  customerId: number
  customerName?: string
  name: string
  species: string
  breed: string
  gender: string
  birthDate: string
  weightKg: number
  color: string
  allergies: string
  healthNotes: string
  isActive: boolean
}

const SPECIES_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  DOG: { label: 'Chó', icon: '🐕', color: 'orange' },
  CAT: { label: 'Mèo', icon: '🐈', color: 'cyan' },
  SMALL_PET: { label: 'Thú nhỏ (Hamster/Thỏ)', icon: '🐰', color: 'purple' },
  BIRD: { label: 'Chim cảnh', icon: '🦜', color: 'green' },
  FISH: { label: 'Cá cảnh', icon: '🐠', color: 'blue' },
  OTHER: { label: 'Khác', icon: '🐾', color: 'default' },
}

export const PetsPage: React.FC = () => {
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingPet, setEditingPet] = useState<Pet | null>(null)
  const [form] = Form.useForm()

  const fetchPets = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/pets')
      setPets(res.data)
    } catch {
      // Mock fallback data if backend offline
      setPets([
        {
          id: 1,
          customerId: 2,
          customerName: 'Hoàng Văn Nam',
          name: 'Miu',
          species: 'CAT',
          breed: 'Anh lông ngắn',
          gender: 'FEMALE',
          birthDate: '2022-03-15',
          weightKg: 4.2,
          color: 'Xám tro',
          allergies: 'Không',
          healthNotes: 'Đã tiêm phòng dại & 4 bệnh đầy đủ',
          isActive: true,
        },
        {
          id: 2,
          customerId: 2,
          customerName: 'Hoàng Văn Nam',
          name: 'Bông',
          species: 'DOG',
          breed: 'Poodle',
          gender: 'MALE',
          birthDate: '2021-11-01',
          weightKg: 6.5,
          color: 'Trắng kem',
          allergies: 'Dị ứng da với xà phòng có cồn',
          healthNotes: 'Cần cắt móng và vệ sinh tai định kỳ',
          isActive: true,
        },
        {
          id: 3,
          customerId: 1,
          customerName: 'Nguyễn Thị Hoa',
          name: 'Lu',
          species: 'DOG',
          breed: 'Golden Retriever',
          gender: 'MALE',
          birthDate: '2023-01-20',
          weightKg: 28.0,
          color: 'Vàng kim',
          allergies: 'Không',
          healthNotes: 'Rất hiếu động, ăn thức ăn hạt Royal Canin',
          isActive: true,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPets()
  }, [])

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : null,
      }
      if (editingPet) {
        await axios.put(`/api/pets/${editingPet.id}`, payload)
        message.success('Cập nhật hồ sơ thú cưng thành công!')
      } else {
        await axios.post('/api/pets', payload)
        message.success('Thêm thú cưng mới thành công!')
      }
      setModalVisible(false)
      form.resetFields()
      setEditingPet(null)
      fetchPets()
    } catch (err: any) {
      message.error('Lỗi lưu hồ sơ: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/pets/${id}`)
      message.success('Đã xóa hồ sơ thú cưng!')
      fetchPets()
    } catch {
      message.error('Lỗi khi xóa hồ sơ')
    }
  }

  const openCreateModal = () => {
    setEditingPet(null)
    form.resetFields()
    form.setFieldsValue({ customerId: 2, isActive: true, species: 'DOG', gender: 'MALE' })
    setModalVisible(true)
  }

  const openEditModal = (pet: Pet) => {
    setEditingPet(pet)
    form.setFieldsValue({
      ...pet,
      birthDate: pet.birthDate ? dayjs(pet.birthDate) : null,
    })
    setModalVisible(true)
  }

  const columns = [
    {
      title: 'Thú cưng',
      key: 'name',
      render: (_: any, record: Pet) => {
        const conf = SPECIES_CONFIG[record.species] || SPECIES_CONFIG.OTHER
        return (
          <Space>
            <Avatar style={{ backgroundColor: '#FFF7ED', border: '1px solid #FED7AA', fontSize: 20 }}>
              {conf.icon}
            </Avatar>
            <div>
              <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 15 }}>{record.name}</div>
              <div style={{ fontSize: 12, color: '#64748B' }}>{record.breed || 'Chưa rõ giống'}</div>
            </div>
          </Space>
        )
      },
    },
    {
      title: 'Loài',
      dataIndex: 'species',
      key: 'species',
      render: (species: string) => {
        const conf = SPECIES_CONFIG[species] || SPECIES_CONFIG.OTHER
        return <Tag color={conf.color}>{conf.label}</Tag>
      },
    },
    {
      title: 'Chủ nuôi',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text: string) => text || 'Khách vãng lai',
    },
    {
      title: 'Giới tính & Tuổi',
      key: 'genderAge',
      render: (_: any, record: Pet) => {
        const genderText = record.gender === 'MALE' ? 'Đực ♂' : record.gender === 'FEMALE' ? 'Cái ♀' : 'Chưa rõ'
        const age = record.birthDate ? `${dayjs().diff(dayjs(record.birthDate), 'year')} tuổi` : 'Chưa rõ'
        return <span>{genderText} • {age}</span>
      },
    },
    {
      title: 'Cân nặng',
      dataIndex: 'weightKg',
      key: 'weightKg',
      render: (w: number) => (w ? `${w} kg` : '-'),
    },
    {
      title: 'Dị ứng & Sức khỏe',
      key: 'health',
      render: (_: any, record: Pet) => (
        <div>
          {record.allergies && record.allergies !== 'Không' ? (
            <Tag color="red">Dị ứng: {record.allergies}</Tag>
          ) : (
            <Tag color="green">Bình thường</Tag>
          )}
          {record.healthNotes && (
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>{record.healthNotes}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Pet) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
            🐾 Hồ Sơ Thú Cưng (Pets)
          </h2>
          <span style={{ fontSize: 14, color: '#64748B' }}>
            Theo dõi giống loài, cân nặng, tiền sử dị ứng và thói quen ăn uống của từng bé cưng
          </span>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreateModal}
          style={{ background: '#F97316', borderColor: '#F97316', borderRadius: 12, fontWeight: 600, height: 40 }}
        >
          Thêm Bé Mới
        </Button>
      </div>

      {/* Main Table */}
      <Card
        style={{
          borderRadius: 16,
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          columns={columns}
          dataSource={pets}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal Add/Edit */}
      <Modal
        title={editingPet ? 'Cập Nhật Hồ Sơ Bé Cưng' : 'Thêm Hồ Sơ Thú Cưng Mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText="Lưu hồ sơ"
        cancelText="Hủy"
        okButtonProps={{ style: { background: '#F97316', borderColor: '#F97316' } }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Tên bé cưng" rules={[{ required: true, message: 'Vui lòng nhập tên bé!' }]}>
            <Input placeholder="Ví dụ: Miu, Bông, Lu..." />
          </Form.Item>

          <Form.Item name="species" label="Loài" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'DOG', label: '🐕 Chó' },
                { value: 'CAT', label: '🐈 Mèo' },
                { value: 'SMALL_PET', label: '🐰 Thú nhỏ (Hamster/Thỏ)' },
                { value: 'BIRD', label: '🦜 Chim' },
                { value: 'FISH', label: '🐠 Cá cảnh' },
                { value: 'OTHER', label: '🐾 Khác' },
              ]}
            />
          </Form.Item>

          <Form.Item name="breed" label="Giống loài">
            <Input placeholder="Ví dụ: Poodle, Corgi, Anh lông ngắn..." />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="gender" label="Giới tính">
              <Select
                options={[
                  { value: 'MALE', label: 'Đực ♂' },
                  { value: 'FEMALE', label: 'Cái ♀' },
                  { value: 'UNKNOWN', label: 'Chưa rõ' },
                ]}
              />
            </Form.Item>

            <Form.Item name="weightKg" label="Cân nặng (kg)">
              <InputNumber style={{ width: '100%' }} step={0.1} min={0} placeholder="Ví dụ: 4.5" />
            </Form.Item>
          </div>

          <Form.Item name="birthDate" label="Ngày sinh (hoặc ngày nhận nuôi)">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày sinh" />
          </Form.Item>

          <Form.Item name="allergies" label="Tiền sử dị ứng (rất quan trọng cho thức ăn & spa)">
            <Input placeholder="Ví dụ: Dị ứng thịt gà, dị ứng xà phòng cồn..." />
          </Form.Item>

          <Form.Item name="healthNotes" label="Ghi chú sức khỏe & thói quen">
            <Input.TextArea rows={3} placeholder="Ví dụ: Đã tiêm phòng 4 bệnh, thích ăn pate Whiskas..." />
          </Form.Item>

          <Form.Item name="customerId" label="Mã khách hàng sở hữu" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
