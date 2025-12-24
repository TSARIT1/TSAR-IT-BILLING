package com.tsarit.billing.service;
import java.util.List;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.element.AreaBreak;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.LineSeparator;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.AreaBreakType;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.tsarit.billing.model.Business;
import com.tsarit.billing.model.Godown;
import com.tsarit.billing.model.GstDetails;
import com.tsarit.billing.model.Product;
import com.tsarit.billing.model.User;
import com.tsarit.billing.model.UserBusiness;
import com.tsarit.billing.repository.GstDetailsRepository;
import com.tsarit.billing.repository.ProductRepository;
import com.tsarit.billing.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class PdfService {
	
	@Autowired
	private UserRepository userRepository;

	@Autowired
	private GstDetailsRepository gstDetailsRepository;

    // Export all products (table format)
    public byte[] generateProductsPdf(List<Product> products) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Title
            document.add(new Paragraph("Product List")
                    .setBold()
                    .setFontSize(16)
                    .setTextAlignment(TextAlignment.CENTER));
            document.add(new Paragraph("\n"));

            float[] columnWidths = {
                    70F, 100F, 80F, 60F, 80F, 80F,
                    60F, 60F, 80F, 60F, 60F, 80F,
                    100F, 100F, 120F
            };
            Table table = new Table(columnWidths).setWidth(100);

            // Headers
            String[] headers = {
                    "Code", "Name", "Category", "Unit", "Purchase Price", "Selling Price",
                    "Stock Qty", "Min Stock", "Barcode", "Tax %", "Discount %",
                    "Expiry Date", "Manufacturer", "Supplier", "Description"
            };
            for (String header : headers) {
                table.addHeaderCell(header);
            }

            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");

            // Rows
            for (Product p : products) {
                table.addCell(nullSafe(p.getProductCode()));
                table.addCell(nullSafe(p.getProductName()));
                table.addCell(nullSafe(p.getCategory()));
                table.addCell(nullSafe(p.getUnit()));
                table.addCell(p.getPurchasePrice() != null ? p.getPurchasePrice().toString() : "0.0");
                table.addCell(p.getSellingPrice() != null ? p.getSellingPrice().toString() : "0.0");
                table.addCell(p.getStockQuantity() != null ? p.getStockQuantity().toString() : "0");
                table.addCell(p.getMinStockLevel() != null ? p.getMinStockLevel().toString() : "0");
                table.addCell(nullSafe(p.getBarcode()));
                table.addCell(p.getTaxRate() != null ? p.getTaxRate().toString() : "0.0");
                table.addCell(p.getDiscount() != null ? p.getDiscount().toString() : "0.0");
                table.addCell(p.getExpiryDate() != null ? p.getExpiryDate().format(dateFormatter) : "");
                table.addCell(nullSafe(p.getManufacturerNameOrCode()));
                table.addCell(nullSafe(p.getSupplierNameOrCode()));
                table.addCell(nullSafe(p.getDescription()));
            }

            document.add(table);
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            e.printStackTrace();
            return new byte[0];
        }
    }

    // Export a single product (invoice style)
    public byte[] generateProductPdf(Product product) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");

            // Title
            document.add(new Paragraph("Product Details")
                    .setBold()
                    .setFontSize(18)
                    .setTextAlignment(TextAlignment.CENTER));
            document.add(new Paragraph("\n"));

            // Table with 2 columns (label + value)
            Table table = new Table(new float[]{150F, 300F}).setWidth(100);

            addRow(table, "Product Code", nullSafe(product.getProductCode()));
            addRow(table, "Name", nullSafe(product.getProductName()));
            addRow(table, "Category", nullSafe(product.getCategory()));
            addRow(table, "Unit", nullSafe(product.getUnit()));
            addRow(table, "Purchase Price", product.getPurchasePrice() != null ? product.getPurchasePrice().toString() : "0.0");
            addRow(table, "Selling Price", product.getSellingPrice() != null ? product.getSellingPrice().toString() : "0.0");
            addRow(table, "Stock Quantity", product.getStockQuantity() != null ? product.getStockQuantity().toString() : "0");
            addRow(table, "Min Stock Level", product.getMinStockLevel() != null ? product.getMinStockLevel().toString() : "0");
            addRow(table, "Barcode", nullSafe(product.getBarcode()));
            addRow(table, "Tax Rate (%)", product.getTaxRate() != null ? product.getTaxRate().toString() : "0.0");
            addRow(table, "Discount (%)", product.getDiscount() != null ? product.getDiscount().toString() : "0.0");
            addRow(table, "Expiry Date", product.getExpiryDate() != null ? product.getExpiryDate().format(dateFormatter) : "");
            addRow(table, "Manufacturer", nullSafe(product.getManufacturerNameOrCode()));
            addRow(table, "Supplier", nullSafe(product.getSupplierNameOrCode()));
            addRow(table, "Description", nullSafe(product.getDescription()));

            document.add(table);
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            e.printStackTrace();
            return new byte[0];
        }
    }

  

    private String nullSafe(String value) {
        return value != null ? value : "";  // Return empty string instead of null
    }

	private void addRow(Table table, String label, String value) {
        table.addCell(new Paragraph(label).setBold());
        table.addCell(new Paragraph(value));
    }

	
	
	// Generate Godown Report with all godowns and their products
	public byte[] generateGodownReport(
	        List<Godown> godowns,
	        UserBusiness userBusiness,
	        User user,
	        Optional <GstDetails> gstDetails,
	        ProductRepository productRepository
	) {
	String businessId = userBusiness.getBusiness().getId();
	String userId = userBusiness.getUser().getId();

	/* ---- FETCH USER NAME ---- */
	String userName = user != null ? user.getOwnerName() : "";

	/* ---- FETCH GST NO USING BUSINESS ID ---- */

	String gstNo = gstDetails.map(GstDetails::getGstNo).orElse("");
	{
	    try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {

	        PdfWriter writer = new PdfWriter(out);
	        PdfDocument pdf = new PdfDocument(writer);
	        Document document = new Document(pdf, PageSize.A4);
	        document.setMargins(25, 25, 25, 25);

	        /* ================= BUSINESS HEADER ================= */
	        if (!godowns.isEmpty()
	                && godowns.get(0).getUserBusiness() != null
	                && godowns.get(0).getUserBusiness().getBusiness() != null) {

	            Business business = godowns.get(0).getUserBusiness().getBusiness();

	            Table header = new Table(new float[]{1, 4});// 1 row 4 columns
	            header.setWidth(UnitValue.createPercentValue(100));

	            // Logo
	            Cell logoCell = new Cell().setBorder(Border.NO_BORDER);
	            if (business.getBusinessLogo() != null) {
	                Image logo = new Image(
	                        ImageDataFactory.create(business.getBusinessLogo())
	                );
	                logo.scaleToFit(70, 70); // width and height
	                logoCell.add(logo);
	            }
	            header.addCell(logoCell);

	            // Company Info
	            Cell infoCell = new Cell().setBorder(Border.NO_BORDER);
	            infoCell.add(new Paragraph(business.getBusinessName())
	                    .setBold().setFontSize(14));
	         //   infoCell.add(new Paragraph("Business ID : " + business.getId()).setFontSize(10));
	            infoCell.add(new Paragraph(
	                    "User : " + userName
	            ).setFontSize(10));
	            infoCell.add(new Paragraph("Email : " + nullSafe(business.getEmail())).setFontSize(10));
	            infoCell.add(new Paragraph("Contact : " + nullSafe(business.getPhoneNo())).setFontSize(10));
	            infoCell.add(new Paragraph(
	                    "GSTIN : " + gstNo
	            ).setFontSize(10));
	            header.addCell(infoCell);

	            document.add(header);
	        }

	        document.add(new LineSeparator(new SolidLine()));
	    //    document.add(new Paragraph("\n"));

	        /* ================= REPORT TITLE ================= */
	        document.add(new Paragraph("Godown & Inventory Report")
	                .setBold()
	                .setFontSize(16)
	                .setTextAlignment(TextAlignment.CENTER));

	        Paragraph datePara = new Paragraph(
	                "Date : " + LocalDate.now()
	                        .format(DateTimeFormatter.ofPattern("dd-MM-yyyy"))
	        )
	        .setFontSize(10)
	        .setTextAlignment(TextAlignment.RIGHT);

	        document.add(datePara);
	        document.add(new LineSeparator(new SolidLine()));
	        document.add(new Paragraph("\n"));
	        
	     //   document.add(new Paragraph("\n"));
	       
	    //    document.add(new Paragraph("\n"));
	        Paragraph allGodownTitle = new Paragraph("All Godowns Info:")
	                .setBold()
	                .setUnderline()
	                .setFontSize(13);

	        document.add(allGodownTitle);
	        document.add(new Paragraph("\n"));

	        /* ================= GODOWN LOOP ================= */
	        for (Godown godown : godowns) {

	            /* -------- Godown Info Row -------- */
	            Table godownInfo = new Table(new float[]{3, 3, 4, 3});
	            godownInfo.setWidth(UnitValue.createPercentValue(100));

	            godownInfo.addHeaderCell(headerCell("Godown ID"));
	            godownInfo.addHeaderCell(headerCell("Godown Name"));
	            godownInfo.addHeaderCell(headerCell("Location"));
	            godownInfo.addHeaderCell(headerCell("Contact"));

	            godownInfo.addCell(bodyCell(godown.getGodownId()));
	            godownInfo.addCell(bodyCell(godown.getGodownName()));
	            godownInfo.addCell(bodyCell(nullSafe(godown.getLocation())));
	            godownInfo.addCell(bodyCell(nullSafe(godown.getContactNo())));

	            document.add(godownInfo);
	            document.add(new Paragraph("\n"));

	            /* -------- Products Table -------- */
	            Paragraph productInfoTitle = new Paragraph(
	                    "Godown Name: " + godown.getGodownName() + " - Product Info:"
	            )
	            .setBold()
	            .setUnderline()
	            .setFontSize(12);

	            document.add(productInfoTitle);
	            document.add(new Paragraph("\n"));
	            
	            List<Product> products =
	                    productRepository.findByGodown_GodownId(godown.getGodownId());

	            if (products != null && !products.isEmpty()) {

	                Table productTable = new Table(new float[]{3, 3, 4, 2, 2, 2, 2});
	                productTable.setWidth(UnitValue.createPercentValue(100));

	                productTable.addHeaderCell(headerCell("Product ID"));
	                productTable.addHeaderCell(headerCell("Category"));
	                productTable.addHeaderCell(headerCell("Product Name"));
	                productTable.addHeaderCell(headerCell("Total Stock"));
	                productTable.addHeaderCell(headerCell("Available Stock"));
	                productTable.addHeaderCell(headerCell("Total Sales"));
	                productTable.addHeaderCell(headerCell("Unit"));

	                for (Product p : products) {
	                    productTable.addCell(bodyCell(p.getId()));
	                    productTable.addCell(bodyCell(p.getCategory()));
	                    productTable.addCell(bodyCell(p.getProductName()));
	                    productTable.addCell(centerCell(p.getStockQuantity()));
	                    productTable.addCell(centerCell(p.getStockQuantity())); // available
	                    productTable.addCell(centerCell(0)); // sales placeholder
	                    productTable.addCell(centerCell(p.getUnit()));
	                }

	                document.add(productTable);
	            } else {
	                document.add(new Paragraph("No products found in this godown")
	                        .setItalic()
	                        .setFontSize(10));
	            }

	            document.add(new AreaBreak(AreaBreakType.NEXT_PAGE));
	        }

	        document.close();
	        return out.toByteArray();

	    } catch (Exception e) {
	        e.printStackTrace();
	        return new byte[0];
	    }
	}
}
	
	private Cell headerCell(String text) {
	    return new Cell()
	            .add(new Paragraph(text).setBold())
	            .setBackgroundColor(ColorConstants.LIGHT_GRAY)
	            .setTextAlignment(TextAlignment.CENTER)
	            .setPadding(6);
	}

	private Cell bodyCell(Object value) {
	    return new Cell()
	            .add(new Paragraph(value != null ? value.toString() : "-"))
	            .setPadding(6);
	}

	private Cell centerCell(Object value) {
	    return new Cell()
	            .add(new Paragraph(value != null ? value.toString() : "0"))
	            .setTextAlignment(TextAlignment.CENTER)
	            .setPadding(6);
	}
	
    
}
