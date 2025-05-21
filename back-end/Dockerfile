FROM node:18

WORKDIR /app

# คัดลอก package.json และติดตั้ง dependencies
COPY package.json ./
RUN npm install

# คัดลอกเฉพาะโฟลเดอร์ prisma ก่อน
COPY prisma ./prisma/

# คัดลอกโค้ดทั้งหมดไปยัง container
COPY . .

# เปิดพอร์ตที่ใช้งาน
EXPOSE 5000

# ใช้ shell script เพื่อรัน migration และ start server
CMD ["sh", "-c", "echo \"DATABASE_URL=$DATABASE_URL\" > prisma/.env && npx prisma generate && npx prisma db push && node src/server.js && rm prisma/.env"]