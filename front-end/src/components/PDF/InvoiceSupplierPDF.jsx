import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font
} from '@react-pdf/renderer';
import moment from 'moment';
import 'moment/dist/locale/th'; // โหลด locale แบบชัดเจน
import dayjs from 'dayjs';

moment.locale('th');

// โหลดฟอนต์ภาษาไทย
Font.register({
  family: 'THSarabunNew',
  src: '/fonts/Sarabun-Medium.ttf' // แนะนำให้ใส่ไฟล์ใน public/fonts/
});

// สร้าง style
const styles = StyleSheet.create({
  page: {
    fontSize: 12,
    padding: 20,
    fontFamily: 'THSarabunNew', // 👈 เปลี่ยนตรงนี้
  },
  header: {
    textAlign: 'center',

    fontSize: 16,
    fontWeight: 'bold',
  },
  subheader: {
    textAlign: 'center',
  },
  section: {
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',

  },
  cell: {
    flex: 1,
    padding: 2,
    border: '1pt solid black',
    textAlign: 'center',
  },
  tableHeader: {
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    paddingHorizontal: 20,
  },
});



const InvoiceSupplierPDF = (prop) => {
  moment.locale('th'); // สำคัญมาก


  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>{prop.data.supplier.name}</Text>
        <Text style={styles.subheader}>{prop.data.supplier.address}</Text>
        <Text style={styles.subheader}>โทร {prop.data.supplier.contactInfo}</Text>
        <Text style={{ ...styles.header, marginTop: 10 }}>ใบชั่งน้ำหนัก </Text>

        <View style={styles.section}>
          <Text>เลขที่: {prop.data.id}</Text>
          <Text>บริษัท: </Text>
          <Text>สินค้า: {prop.data.product.name} ราคา : {prop.data.cost}</Text>
          <Text>การขนส่ง: {prop.data.truckQueue.vehicle.model}</Text>
          <Text>วันที่: {dayjs(prop.data.createdAt).locale('th').format('DD/MM/YYYY')}</Text>
        </View>

        {/* ตาราง */}
        <View style={{ marginTop: 15 }}>
          <View style={[styles.row, styles.tableHeader]}>
            <Text style={styles.cell}>รายการ</Text>
            <Text style={styles.cell}>ทะเบียนรถ</Text>
            <Text style={styles.cell}>วัน/เดือน/ปี</Text>
            <Text style={styles.cell}>เวลา</Text>
            <Text style={styles.cell}>น้ำหนัก </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.cell}>เข้า</Text>
            <Text style={styles.cell}>{prop.data.truckQueue.vehicle.plateNumber}</Text>
            <Text style={styles.cell}>{dayjs(prop.data.dateIn).locale('th').format("DD/MM/YYYY")}</Text>
            <Text style={styles.cell}>{dayjs(prop.data.dateOut).format("HH:mm")}</Text>
            <Text style={styles.cell}>{prop.data.weightIn}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.cell}>ออก</Text>
            <Text style={styles.cell}>{prop.data.truckQueue.vehicle.plateNumber}</Text>
            <Text style={styles.cell}>{dayjs(prop.data.dateOut).locale('th').format("DD/MM/YYYY")}</Text>
            <Text style={styles.cell}>{dayjs(prop.data.dateOut).format("HH:mm")}</Text>
            <Text style={styles.cell}>{prop.data.weightOut}</Text>
          </View>
        </View>

        {/* น้ำหนักสุทธิ */}
        <View style={{ marginTop: 10 }}>
          <Text>น้ำหนักสุทธิ: {(prop.data.weightOut - prop.data.weightIn)} กิโลกรัม</Text>
          <Text>ราคา/ตัน: {prop.data.cost} บาท</Text>
          <Text>จำนวนเงิน: {(prop.data.weightOut - prop.data.weightIn) * prop.data.cost} บาท</Text>
        </View>

        {/* ลายเซ็น */}
        <View style={styles.signatureRow}>
          <View>
            <Text>_________________________________</Text>
            <Text style={{marginTop:"5" , textAlign:'center'}}>            พนักงานชั่ง</Text>
          </View>
          <View>
            <Text>_________________________________</Text>
            <Text style={{marginTop:"5" , textAlign:'center'}}>           พนักงานขับรถ</Text>
          </View>

        </View>
      </Page>
    </Document>
  )
}

export default InvoiceSupplierPDF