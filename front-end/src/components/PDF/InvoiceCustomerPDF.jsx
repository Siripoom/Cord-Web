import React from 'react';
import {
    Page,
    Text,
    View,
    Document,
    StyleSheet,
    PDFViewer,
    PDFDownloadLink,
    Font
} from '@react-pdf/renderer';
import PropTypes from "prop-types";
import moment from 'moment';
import 'moment/dist/locale/th'; // โหลด locale แบบชัดเจน

moment.locale('th');



// โหลดฟอนต์ภาษาไทย
Font.register({
    family: 'THSarabunNew',
    src: '/fonts/Sarabun-Medium.ttf' // แนะนำให้ใส่ไฟล์ใน public/fonts/
});

const styles = StyleSheet.create({
    page: { padding: 30, fontSize: 12, fontFamily: 'THSarabunNew' },
    header: { textAlign: 'center', marginBottom: 10 },
    headerFirst: { textAlign: 'center', margin: 10, fontWeight: 'bold' },
    section: { marginBottom: 10 },
    table: { display: 'table', width: 'auto', borderStyle: 'solid', borderWidth: 1 },
    tableRow: { flexDirection: 'row', textAlign: "center" },
    tableRowDetail: { flexDirection: 'row' },
    tableHeaderDetail: { width: '50%', marginTop: "2", marginBottom: "2" },
    tableColHeader: { width: '14%', borderStyle: 'solid', borderWidth: 1, padding: 2, backgroundColor: '#FE7743' },
    tableCol: { width: '14%', borderStyle: 'solid', borderWidth: 1, padding: 2 },
    tableColWideHeader: { width: '30%', borderStyle: 'solid', borderWidth: 1, padding: 2, backgroundColor: '#FE7743' },
    tableColWide: { width: '30%', borderStyle: 'solid', borderWidth: 1, padding: 2 },
    footer: { marginTop: 30, flexDirection: 'row', justifyContent: 'space-between' },
    footerItem: { width: "100%", textAlign: "center" },
    headerTable: { display: 'table', width: 'auto' }
});

const InvoiceCustomerPDF = (prop) => {
    const totalQty = prop.data.InvoiceCustomer.reduce((sum, i) => sum + i.quantity, 0);
    const totalWeight = prop.data.InvoiceCustomer.reduce((sum, i) => sum + i.weight, 0).toFixed(2);
    const selectedMonth = moment(prop.data.dueDate, 'YYYY-MM'); // เช่น มีนาคม 2568
    moment.locale('th'); // สำคัญมาก

    const startDate = 1;
    const endDate = selectedMonth.endOf('month').date(); // อัตโนมัติเป็น 28, 30, 31 แล้วแต่เดือน
    const monthName = selectedMonth.format('MMMM'); // มีนาคม
    const yearBE = selectedMonth.year()+543 // เปลี่ยนเป็น พ.ศ.

    const dateRangeText = `วันที่ ${startDate}-${endDate} ${monthName} ${yearBE}`;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.header}>
                    บริษัท ทรัพย์รุ่งเรือง 2562 จำกัด{"\n"}
                    เลขที่ 88/8 หมู่ที่ 4 ต.หนองกระทุ่ม อ.กำแพงแสน จ.นครปฐม{"\n"}
                    โทรศัพท์ 081-9327257, 081-9487614{"\n"}

                </Text>
                <Text style={styles.headerFirst}>ใบวางบิล</Text>

                <View style={styles.tableRowDetail}>
                    <Text style={styles.tableHeaderDetail}>ชื่อลูกค้า: {prop.data.customer.name}</Text>
                    <Text style={styles.tableHeaderDetail}>{dateRangeText}</Text>
                </View>


                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableColHeader}>ลำดับที่</Text>
                        <Text style={styles.tableColWideHeader}>รายการสินค้า</Text>
                        <Text style={styles.tableColHeader}>จำนวน </Text>
                        <Text style={styles.tableColHeader}>น้ำหนัก(ก.ก.)</Text>
                        <Text style={styles.tableColHeader}>ราคา</Text>
                        <Text style={styles.tableColHeader}>จำนวนเงิน </Text>
                    </View>
                    {prop.data.InvoiceCustomer.map((item, index) => (
                        <View style={styles.tableRow} key={index}>
                            <Text style={styles.tableCol}>{index + 1}</Text>
                            <Text style={styles.tableColWide}>{item.product.name}</Text>
                            <Text style={styles.tableCol}>{item.quantity}</Text>
                            <Text style={styles.tableCol}>{item.weight}</Text>
                            <Text style={styles.tableCol}>{item.price}</Text>
                            <Text style={styles.tableCol}>{item.amount}</Text>
                        </View>
                    ))}
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCol}></Text>
                        <Text style={styles.tableColWide}>รวม</Text>
                        <Text style={styles.tableCol}>{totalQty}</Text>
                        <Text style={styles.tableCol}>{totalWeight}</Text>
                        <Text style={styles.tableCol}></Text>
                        <Text style={styles.tableCol}>{prop.data.totalAmount}</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <View style={styles.footerItem}>
                        <Text>บริษัท ทรัพย์รุ่งเรือง 2562 จำกัด </Text>
                        <Text style={{ marginBottom: "2" }}>{"\n"}_________________________________</Text>
                        <Text >ผู้วางบิล</Text>
                    </View>
                    <View style={styles.footerItem}>
                        <Text>{prop.data.customer.name}</Text>
                        <Text style={{ marginBottom: "2" }}>{"\n"}_________________________________</Text>
                        <Text >ผู้รับวางบิล</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default InvoiceCustomerPDF;
