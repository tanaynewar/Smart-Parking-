import jsPDF from "jspdf";
import { PAYMENT_STATUS } from "./constant.js";

export const downloadReceipt = (transaction, user, wallet) => {

    const doc = new jsPDF({ unit: "pt", format: "a5" });

    const primaryColor  = [24, 95, 165];   // #185fa5
    const lightGray     = [245, 247, 250];
    const darkText      = [17, 17, 17];
    const mutedText     = [107, 114, 128];

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 36;
    const contentW = pageW - margin * 2;

    // Header bar
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageW, 80, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text("Transaction Receipt", margin, 38);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(200, 220, 245);
    doc.text("Official payment confirmation", margin, 56);

    // Status badge (top-right of header)
    const statusLabel =
        transaction.payment_status === PAYMENT_STATUS.SUCCESS ? "SUCCESS"
        : transaction.payment_status === PAYMENT_STATUS.FAILED  ? "FAILED"
        : "PENDING";

    const badgeColor =
        transaction.payment_status === PAYMENT_STATUS.SUCCESS ? [15, 123, 50]
        : transaction.payment_status === PAYMENT_STATUS.FAILED  ? [180, 35, 24]
        : [133, 79, 11];

    doc.setFillColor(...badgeColor);
    const badgeW = 64;
    const badgeH = 18;
    const badgeX = pageW - margin - badgeW;
    const badgeY = 30;
    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 4, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(statusLabel, badgeX + badgeW / 2, badgeY + 12, { align: "center" });

    // Amount highlight box
    doc.setFillColor(...lightGray);
    doc.roundedRect(margin, 96, contentW, 74, 8, 8, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...mutedText);
    doc.text("Transaction Amount", margin + 16, 118);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(...primaryColor);
    doc.text(`Rs. ${transaction.transaction_amount}`, margin + 16, 138);

    // Type badge
    const typeLabel = transaction.transaction_type === "credit" ? "CREDIT" : "DEBIT";
    const typeColor = transaction.transaction_type === "credit" ? [15, 123, 50] : [180, 35, 24];
    const typeBgColor = transaction.transaction_type === "credit" ? [209, 250, 229] : [254, 226, 226];
    doc.setFillColor(...typeBgColor);
    const typeBadgeW = 52;
    const typeBadgeH = 15;
    const typeBadgeX = margin + 16;
    const typeBadgeY = 144;
    doc.roundedRect(typeBadgeX, typeBadgeY, typeBadgeW, typeBadgeH, 4, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...typeColor);
    doc.text(typeLabel, typeBadgeX + typeBadgeW / 2, typeBadgeY + 10, { align: "center" });

    // Divider
    let y = 190;
    doc.setDrawColor(229, 229, 229);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);
    y += 16;

    // Details section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...mutedText);
    doc.text("TRANSACTION DETAILS", margin, y);
    y += 14;

    const rows = [
        ["Transaction ID",  transaction.transaction_id],
        ["Payment Method",  transaction.payment_method],
        ["Date",            new Date(transaction.created_at).toLocaleString()],
        ["Email",           user?.email      || "—"],
        ["Vehicle No.",     user?.car_number || "—"],
    ];

    rows.forEach(([key, value], i) => {

        const rowY  = y + i * 30;
        const isEven = i % 2 === 0;

        if (isEven) {
            doc.setFillColor(249, 250, 251);
            doc.rect(margin, rowY - 10, contentW, 26, "F");
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...mutedText);
        doc.text(key, margin + 10, rowY + 6);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(...darkText);
        doc.text(String(value ?? "—"), pageW - margin - 10, rowY + 6, { align: "right" });
    });

    y += rows.length * 30 + 8;

    // Divider
    doc.setDrawColor(229, 229, 229);
    doc.line(margin, y, pageW - margin, y);
    y += 14;

    // Wallet summary (if available)
    if (wallet) {

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...mutedText);
        doc.text("WALLET SUMMARY", margin, y);
        y += 14;

        const walletRows = [
            ["Current Balance", `Rs. ${wallet.walletBalance ?? "0.00"}`],
            ["Total Credit",    `Rs. ${wallet.totalCredit   ?? "0.00"}`],
            ["Total Debit",     `Rs. ${wallet.totalDebit    ?? "0.00"}`],
        ];

        walletRows.forEach(([key, value], i) => {

            const rowY = y + i * 26;

            if (i % 2 === 0) {
                doc.setFillColor(249, 250, 251);
                doc.rect(margin, rowY - 8, contentW, 22, "F");
            }

            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(...mutedText);
            doc.text(key, margin + 10, rowY + 6);

            doc.setFont("helvetica", "bold");
            doc.setTextColor(...darkText);
            doc.text(value, pageW - margin - 10, rowY + 6, { align: "right" });
        });

        y += walletRows.length * 26 + 10;
    }

    // Footer
    doc.setFillColor(...primaryColor);
    doc.rect(0, pageH - 36, pageW, 36, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(200, 220, 245);
    doc.text(
        `Generated on ${new Date().toLocaleString()}`,
        pageW / 2,
        pageH - 18,
        { align: "center" }
    );

    doc.save(`receipt_${transaction.transaction_id}.pdf`);
};