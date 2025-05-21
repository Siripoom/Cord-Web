import React, { useState, useForm, useEffect } from 'react'
import { Card, Row, Col, Typography, Statistic, Table, Flex, Button, Modal, Form, Input, DatePicker, InputNumber, message, Select, Drawer } from "antd"
import { BuildOutlined, DeleteFilled, DeleteOutlined, EyeFilled, EyeOutlined, HomeOutlined, MinusOutlined, PlusCircleOutlined, PrinterOutlined, ToolOutlined } from "@ant-design/icons"
import dayjs from 'dayjs'
import { addInvoiceCustomer, addInvoiceSupplier, deleteInvoiceCustomer, deleteInvoiceSupplier, getCustomers, getInvoiceCustomer, getInvoiceSupplier, getSuppliers, getTruckQueues } from '../../services/api'
import InvoiceSupplierPDF from '../../components/PDF/InvoiceSupplierPDF'
import { PDFDownloadLink } from '@react-pdf/renderer'


const { Title } = Typography
const InvoiceSupplier = () => {
  const [showModal, setShowModal] = useState(false)
  const [showModalDelate, setShowModalDelete] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showDeawer, setShowDeawer] = useState(false)
  const [weightIn, setWeightIn] = useState(0)
  const [weightOut, setWeightOut] = useState(0)
  const [supplier, setSupplier] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [truckQueue, setTruckQueue] = useState([])
  const [product, setProduct] = useState(null)
  const [rowProduct, setRowProduct] = useState(0)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [form] = Form.useForm()
  const token = localStorage.getItem('token')


  const fetchInvoicesSupplier = async () => {
    try {
      const res = await getInvoiceSupplier(token);
      setInvoices(res.data)
    } catch (error) {
      console.log(error)
    }
  }

  const fetchSupplier = async () => {
    try {
      const res = await getSuppliers(token);
      setSupplier(res.data)
    } catch (error) {
      console.log(error)
    }
  }

  const fetchQueueDriver = async () => {
    try {
      const res = await getTruckQueues(token);
      const filterStatus = res.data.filter(item => item.status === 'pending')
      setTruckQueue(filterStatus)
    } catch (error) {
      console.log(error)
    }
  }

  const calculatorTotalAmount = () => {
    if (weightIn > 0 && weightOut > 0 && selectedProduct?.costPrice) {
      let amount = (weightOut - weightIn) * selectedProduct?.costPrice
      form.setFieldsValue({
        totalAmount: amount,
      });
    }
  }

  useEffect(() => {
    fetchInvoicesSupplier();
    fetchSupplier();
    fetchQueueDriver();
  }, [])

  useEffect(() => {
    calculatorTotalAmount()
  }, [weightIn, weightOut, selectedProduct])

  const changeProduct = async (value) => {
    const filterProduct = supplier.filter((item) => item.id === value)
    setProduct(filterProduct[0].Product)
    setRowProduct(1)
  }

  const showModalForm = (record = null) => {
    setSelectedInvoice(record)
    if (record) {
      form.setFieldsValue({
        dueDate: dayjs(),
        customer: record.customer,
        totalAmount: record.totalAmount,
      })
    } else {
      form.setFieldsValue({
        dueDate: dayjs(),
        dateIn: dayjs(),
        dateOut: dayjs(),
      })
    }
    setShowModal(true);
  }

  const closeModalForm = () => {
    setShowModal(false);
    setSelectedInvoice(null);
    setRowProduct(0)
    setProduct(null)
    form.resetFields()
  }

  const showDrawer = (record) => {
    setSelectedInvoice(record)
    setShowDeawer(true)
  }

  const closeDrawer = () => {
    setShowDeawer(false)
    setSelectedInvoice(null)
  }

  const handleFinish = async (value) => {
    try {
      // console.log("Submit Form : ", value)
      if (selectedInvoice !== null) {
        // Update invoice
        console.log("Update Invoice : ", selectedInvoice.id)
      } else {
        const res = await addInvoiceSupplier(value, token)
        console.log(res)
        if (res.success) {
          message.success("เพิ่มข้อมูลใบวางบิลสำเร็จ")
          fetchInvoicesSupplier()
          fetchQueueDriver()
          closeModalForm()

        } else {
          message.error("เพิ่มข้อมูลใบวางบิลไม่สำเร็จ")
        }

      }
    } catch (error) {
      console.log(error)
    }

  }

  const selectProduct = (value) => {
    const filterProduct = product.filter((item) => item.id === value);
    if (filterProduct.length > 0) {
      setSelectedProduct(filterProduct[0]);
      form.setFieldsValue({
        cost: filterProduct[0].costPrice, // อัปเดตค่า cost ในฟอร์ม
      });
    }
  };



  const handleDelete = (record) => {
    setSelectedInvoice(record)
    setShowModalDelete(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      console.log(selectedInvoice)
      const res = await deleteInvoiceSupplier(selectedInvoice.id, token)
      if (res.success) {
        message.success("ลบข้อมูลใบวางบิลสำเร็จ")
        fetchInvoicesSupplier()
        setShowModalDelete(false)
      } else {
        message.error("ลบข้อมูลใบวางบิลไม่สำเร็จ")
      }
    } catch (error) {
      console.log(error)
      message.error("เกิดข้อผิดพลาดในการลบข้อมูลใบวางบิล")
    }
  }


  const createPDF = () => { }

  const columns = [
    {
      title: 'เลขที่ใบวางบิล',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'วันที่',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY')

    },
    {
      title: 'ชื่อสินค้่า',
      dataIndex: 'product',
      key: 'product',
      render: (product) => product.name || '-'
    },
    {
      title: 'ราคารวม',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      render: (_, record) => (
        <Flex>
          <Button style={{ color: '#000', marginRight: '5px' }} onClick={() => showDrawer(record)}><EyeOutlined /></Button>
          <Button style={{ color: 'red', marginRight: '5px' }} onClick={() => handleDelete(record)}><DeleteFilled /></Button>
          <PDFDownloadLink
            document={<InvoiceSupplierPDF data={record} />}
            fileName={
              'ใบวางบิล_' +
              (record ? record.supplier.name : '') + '_' +
              (record ? dayjs(record.dueDate).locale('th').format('MMMM-YYYY') : '') +
              '.pdf'
            }

          >
            <Button type='primary' style={{ marginRight: "10px" }} onClick={createPDF}><PrinterOutlined /></Button>
          </PDFDownloadLink>
        </Flex>

      )
    }
  ]

  const columnDetail = [
    {
      title: 'ชื่อสินค้า',
      dataIndex: 'product',
      key: 'product',
      render: (product) => product.name || '-'
    },
    {
      title: 'ราคา',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'จำนวน',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'น้ำหนักสุทธิ',
      dataIndex: 'weight',
      key: 'weight',
    },
    {
      title: 'ราคารวม',
      dataIndex: 'amount',
      key: 'amount',
    },
  ]

  return (
    <div className="costs-container">
      <div className="content-wrapper">
        {/* Breadcrumb */}
        <div className="page-header">
          <div className="breadcrumb">
            <HomeOutlined /> / รายงานการส่งออก / ใบวางบิล (ซัพพลายเออร์)
          </div>
          <Title level={4}>ใบวางบิล (ซัพพลายเออร์)</Title>
        </div>

        {/* Statistics Section */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={12}>
            <Card className="stat-card">
              <Statistic
                title="รายการทั้งหมด"
                value={invoices.length}
                prefix={<BuildOutlined />}
                suffix="รายการ"
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={24} md={24}>
            <Card>
              <Flex style={{ marginBottom: '24px' }} justify="space-between" alignItems="center">
                <Title level={5} className='py-auto'>ใบวางบิลซัพพลายเออร์</Title>
                <Button
                  type='primary' onClick={() => showModalForm()}>เพิ่มใบวางบิล</Button>
              </Flex>
              <Table
                columns={columns}
                dataSource={invoices}
                rowKey="id"
                pagination={false}
                scroll={{ x: 800 }}
              />
            </Card>
          </Col>
        </Row>

      </div>
      <Modal
        title={
          selectedInvoice
            ? "แก้ไขข้อมูลใบวางบิล"
            : "เพิ่มข้อมูลใบวางบิล"
        }
        visible={showModal}
        onCancel={closeModalForm}
        footer={null}
        width={800}
      >

        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}

        >
          <Form.Item
            name={'dueDate'}
            label="วันที่"
            rules={[{ required: true, message: 'กรุณาเลือกวันที่' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name={'supplierId'}
                label="ซัพพลายเออร์"
                rules={[{ required: true, message: 'กรุณาเลือกชื่อซัพพลายเออร์' }]}
              >
                <Select onChange={changeProduct}>
                  {supplier && supplier.map((item) => (
                    <Select.Option key={item.id} value={item.id}>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={'productId'}
                label="สินค้า"
                rules={[{ required: true, message: 'กรุณาเลือกสินค้า' }]}
              >
                <Select onChange={(value) => selectProduct(value)}>
                  {product && product.map((item) => (
                    <Select.Option key={item.id} value={item.id}>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={'cost'}
                label="ราคา"
                rules={[{ required: true, message: 'กรุณากรอกราคา' }]}
              >
                <InputNumber value={selectedProduct ? selectedProduct.costPrice : '0'} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={'truckQueueId'}
                label="คิวรถบรรทุก"
                rules={[{ required: true, message: 'กรุณากรอกราคา' }]}
              >
                <Select>
                  {truckQueue && truckQueue.map((item) => (
                    <Select.Option key={item.id} value={item.id}>
                      ผู้ขับ: {item.driver.name} || ทะเบียน: {item.vehicle.plateNumber}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name={'weightIn'}
                label="น้ำหนักเข้า"
                rules={[{ required: true, message: 'กรุณากรอกน้ำหนักเข้า' }]}
              >
                <InputNumber onChange={(value) => setWeightIn(value)} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={'weightOut'}
                label="น้ำหนักออก"
                rules={[{ required: true, message: 'กรุณากรอกน้ำหนักออก' }]}
              >
                <InputNumber onChange={(value) => setWeightOut(value)} style={{ width: '100%' }} />
              </Form.Item>
            </Col>

          </Row>


          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name={'dateIn'}
                label="วันที่เข้า"
                rules={[{ required: true, message: 'กรุณาเลือกวันที่เข้า' }]}
              >
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={'dateOut'}
                label="วันที่ออก"
                rules={[{ required: true, message: 'กรุณาเลือกวันที่ออก' }]}
              >
                <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name={'totalAmount'}
            label="ราคารวม"
            rules={[{ required: true, message: 'กรุณากรอกราคารวม' }]}
          >
            <InputNumber style={{ 'width': '100%' }} disabled='true' />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
            >
              {selectedInvoice ? "บันทึก" : "เพิ่ม"}
            </Button>
            <Button
              style={{ marginLeft: '8px' }}
              onClick={closeModalForm}
            >
              ยกเลิก
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        visible={showDeawer}
        onClose={closeDrawer}
        width={800}
      >
        <div style={{ padding: '20px' }}>
          <Card >
            <Title level={3}>รายละเอียดใบวางบิล</Title>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <p>เลขที่ใบวางบิล : {selectedInvoice && selectedInvoice.id}</p>
              </Col>
              <Col span={12}>
                <p>วันที่ : {selectedInvoice && dayjs(selectedInvoice.dueDate).format('DD/MM/YYYY')}</p>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <p>ชื่อซัพพลายเออร์ : {selectedInvoice && selectedInvoice.supplier.name}</p>
              </Col>
              <Col span={12}>
                <p>ราคารวม : {selectedInvoice && selectedInvoice.totalAmount}</p>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <p>ระยะทาง : {selectedInvoice && selectedInvoice.truckQueue.distanceKm}</p>
              </Col>
            </Row>
          </Card>

          <Card
            title={"รถและผู้ขับขี่"}
            style={{ margin: '20px 0px' }}
          >
            <Row gutter={['16', '16']}>
              <Col span={12}>
                <p>ประเภทรถ : {selectedInvoice && selectedInvoice.truckQueue.vehicle.model}</p>
                <p>ทะเบียนรถ : {selectedInvoice && selectedInvoice.truckQueue.vehicle.plateNumber}</p>
                <p>น้ำมันเชื้อเพลง : {selectedInvoice && selectedInvoice.truckQueue.vehicle.type}</p>
              </Col>
              <Col span={12}>
                <p>ผู้ขับขี่ : {selectedInvoice && selectedInvoice.truckQueue.driver.name}</p>
                <p>เลขใบขับขี่ : {selectedInvoice && selectedInvoice.truckQueue.driver.licenseNo}</p>
                <p>ประเภทใบขับขี่ : {selectedInvoice && selectedInvoice.truckQueue.driver.licenseType}</p>
                <p>วันหมดอายุใบขับขี่ : {selectedInvoice && selectedInvoice.truckQueue.driver.licenseExpire}</p>
                <p>เบอร์โทร : {selectedInvoice && selectedInvoice.truckQueue.driver.phone}</p>
                <p>ที่อยู่ : {selectedInvoice && selectedInvoice.truckQueue.driver.address}</p>
              </Col>
            </Row>
          </Card>

          <Card
            title={"สินค้า"}

          >
            <p>ชื่อสินค้า : {selectedInvoice && selectedInvoice.product.name} </p>
            <p>ราคาต้นทุน : {selectedInvoice && selectedInvoice.product.costPrice} </p>
            <p>น้ำหนักเข้า : {selectedInvoice && selectedInvoice.weightIn}</p>
            <p>น้ำหนักออก : {selectedInvoice && selectedInvoice.weightOut}</p>
            <p>น้ำหนักสุทธิ : {selectedInvoice && (selectedInvoice.weightOut - selectedInvoice.weightIn)}</p>
          </Card>

        </div>


        <Flex justify="end" style={{ marginTop: '20px' }}>

          {selectedInvoice ?
            <PDFDownloadLink
              document={<InvoiceSupplierPDF data={selectedInvoice} />}
              fileName={
                'ใบวางบิล_' +
                (selectedInvoice ? selectedInvoice.supplier.name : '') + '_' +
                (selectedInvoice ? dayjs(selectedInvoice.dueDate).locale('th').format('MMMM-YYYY') : '') +
                '.pdf'
              }
            >
              <Button type='primary' style={{ marginRight: "10px" }} onClick={createPDF}><PrinterOutlined /></Button>
            </PDFDownloadLink>
            : ''}
          <Button onClick={closeDrawer}>ปิด</Button>
        </Flex>
      </Drawer>

      <Modal
        title="ยืนยันการลบ"
        visible={showModalDelate}
        onOk={handleDeleteConfirm}
        onCancel={() => setShowModalDelete(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowModalDelete(false)}>
            ยกเลิก
          </Button>,
          <Button key="delete" type="primary" danger onClick={handleDeleteConfirm}>
            ลบ
          </Button>,
        ]}
      >
        <p>คุณต้องการลบใบวางบิลนี้หรือไม่?</p>
      </Modal>
    </div>
  )
}

export default InvoiceSupplier