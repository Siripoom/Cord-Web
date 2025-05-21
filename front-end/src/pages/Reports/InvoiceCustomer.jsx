import React, { useState, useForm, useEffect } from 'react'
import { Card, Row, Col, Typography, Statistic, Table, Flex, Button, Modal, Form, Input, DatePicker, InputNumber, message, Select, Drawer } from "antd"
import { BuildOutlined, DeleteFilled, DeleteOutlined, EyeFilled, EyeOutlined, HomeOutlined, MinusOutlined, PlusCircleOutlined, PrinterOutlined, ToolOutlined } from "@ant-design/icons"
import { addInvoiceCustomer, deleteInvoiceCustomer, getCustomers, getInvoiceCustomer, getSuppliers } from '../../services/api'
import { PDFDownloadLink } from '@react-pdf/renderer'
import InvoiceCustomerPDF from '../../components/PDF/InvoiceCustomerPDF'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
dayjs.locale('th')


const { Title } = Typography
const InvoiceCustomer = () => {
    const [showModal, setShowModal] = useState(false)
    const [showModalDelate, setShowModalDelete] = useState(false)
    const [showDeawer, setShowDeawer] = useState(false)
    const [customer, setCustomer] = useState(null)
    const [supplier, setSupplier] = useState(null)
    const [invoices, setInvoices] = useState([])
    const [product, setProduct] = useState(null)
    const [date, setDate] = useState(null)
    const [rowProduct, setRowProduct] = useState(0)
    const [selectedSupplier, setSelectedSupplier] = useState(null)
    const [selectedInvoice, setSelectedInvoice] = useState(null)
    const [form] = Form.useForm()
    const token = localStorage.getItem('token')


    const fetchInvoicesCustomer = async () => {
        try {
            const res = await getInvoiceCustomer(token);
            console.log(res.data)
            setInvoices(res.data)
        } catch (error) {
            console.log(error)

        }
    }

    const fetchCustomer = async () => {
        try {
            const res = await getCustomers(token);
            setCustomer(res.data)
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

    useEffect(() => {
        fetchInvoicesCustomer();
        fetchCustomer();
        fetchSupplier();
    }, [])

    const changeProduct = async (value) => {
        const filterProduct = supplier.filter((item) => item.id === value)
        setProduct(filterProduct[0].Product)
        setRowProduct(1)
    }

    const PlusRowProduct = () => {
        setRowProduct(rowProduct + 1)
    }

    const showModalForm = (record = null) => {
        setSelectedInvoice(record)
        if (record) {
            form.setFieldsValue({
                id: record.id,
                dueDate: dayjs(record.dueDate),
                customer: record.customer,
                totalAmount: record.totalAmount,
            })
        } else {
            form.resetFields()
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

                const res = await addInvoiceCustomer(value, token)
                console.log(res)
                if (res.success) {
                    message.success("เพิ่มข้อมูลใบวางบิลสำเร็จ")
                    fetchInvoicesCustomer()
                    closeModalForm()

                } else {
                    message.error("เพิ่มข้อมูลใบวางบิลไม่สำเร็จ")
                }

            }
        } catch (error) {
            console.log(error)
        }

    }

    const handleDelete = (record) => {
        setSelectedInvoice(record)
        setShowModalDelete(true)
    }

    const handleDeleteConfirm = async () => {
        try {
            const res = await deleteInvoiceCustomer(selectedInvoice.id, token)
            if (res.success) {
                message.success("ลบข้อมูลใบวางบิลสำเร็จ")
                fetchInvoicesCustomer()
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
            render: (date) => dayjs(date).locale('th').format('MMMM YYYY')

        },
        {
            title: 'ชื่อลูกค้า',
            dataIndex: 'customer',
            key: 'customer',
            render: (customer) => customer.name || '-'
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
                        document={<InvoiceCustomerPDF data={record} />}
                        fileName={'ใบวางบิล_' + record.customer.name + '_' + dayjs(record.dueDate).locale('th').format('MMMM YYYY') + '.pdf'}
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
                        <HomeOutlined /> / รายงานการส่งออก / ใบวางบิล (ลูกค้า)
                    </div>
                    <Title level={4}>ใบวางบิล (ลูกค้า)</Title>
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
                                <Title level={5} className='py-auto'>ใบวางบิลลูกค้า</Title>
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
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Form.Item
                                name={'customerId'}
                                label="ชื่อลูกค้า"
                                rules={[{ required: true, message: 'กรุณาเลือกชื่อลูกค้า' }]}
                            >
                                <Select>
                                    {customer && customer.map((item) => (
                                        <Select.Option key={item.id} value={item.id}>
                                            {item.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name={'supplierId'}
                                label="ชื่อผู้ขาย"
                                rules={[{ required: true, message: 'กรุณาเลือกชื่อผู้ขาย' }]}
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
                    </Row>

                    <Form.Item
                        name="dueDate"
                        label="เดือน"
                        rules={[{ required: true, message: 'กรุณาเลือกเดือน' }]}
                    >
                        <DatePicker
                            picker="month"
                            style={{ width: '100%' }}
                            placeholder="เลือกเดือน"

                        />
                    </Form.Item>
                    <hr style={{ margin: '10px' }} />
                    {product && Array.from({ length: rowProduct }, (_, i) => (
                        <div key={i}>
                            <Row gutter={[16, 16]}>
                                <Col span={8}>
                                    <Form.Item
                                        name={['InvoiceCustomer', i, 'productId']}
                                        label="ชื่อสินค้า"
                                        rules={[{ required: true, message: 'กรุณาเลือกสินค้า' }]}
                                    >
                                        <Select>
                                            {product && product.map((item) => (
                                                <Select.Option key={item.id} value={item.id}>
                                                    {item.name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={4}>
                                    <Form.Item
                                        name={['InvoiceCustomer', i, 'price']}
                                        label="ราคา"
                                        rules={[{ required: true, message: 'กรุณากรอกราคา' }]}
                                    >
                                        <InputNumber style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item
                                        name={['InvoiceCustomer', i, 'quantity']}
                                        label="จำนวน"
                                        rules={[{ required: true, message: 'กรุณากรอกจำนวน' }]}
                                    >
                                        <InputNumber style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item
                                        name={['InvoiceCustomer', i, 'weight']}
                                        label="น้ำหนักสุทธิ"
                                        rules={[{ required: true, message: 'กรุณากรอกน้ำหนัก' }]}
                                    >
                                        <InputNumber style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>
                    ))}
                    {
                        product ? (<Flex justify="center" alignItems="center">
                            <Button
                                onClick={() => {
                                    setRowProduct(rowProduct - 1)
                                }}
                                style={{ marginRight: '8px' }}
                            ><MinusOutlined />
                            </Button>
                            <Button onClick={PlusRowProduct}><PlusCircleOutlined /></Button>
                        </Flex>) : ''
                    }


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
                    <Title level={3}>รายละเอียดใบวางบิล</Title>

                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <p>เลขที่ใบวางบิล : {selectedInvoice && selectedInvoice.id}</p>
                        </Col>
                        <Col span={12}>
                            <p>เดือน : {selectedInvoice && dayjs(selectedInvoice.dueDate).locale('th').format('MMMM YYYY')}</p>

                        </Col>
                    </Row>
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <p>ชื่อลูกค้า : {selectedInvoice && selectedInvoice.customer.name}</p>
                        </Col>
                        <Col span={12}>
                            <p>ราคารวม : {selectedInvoice && selectedInvoice.totalAmount}</p>
                        </Col>
                    </Row>
                </div>

                <Table
                    columns={columnDetail}
                    dataSource={selectedInvoice && selectedInvoice.InvoiceCustomer}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: 800 }}
                />
                <Flex justify="end" style={{ marginTop: '20px' }}>
                    {selectedInvoice ?
                        <PDFDownloadLink
                            document={<InvoiceCustomerPDF data={selectedInvoice} />}
                            fileName={
                                'ใบวางบิล_' +
                                (selectedInvoice ? selectedInvoice.customer.name : '') + '_' +
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

export default InvoiceCustomer