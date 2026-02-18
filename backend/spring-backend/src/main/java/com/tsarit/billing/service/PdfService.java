package com.tsarit.billing.service;

import java.util.List;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.AreaBreak;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.LineSeparator;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.AreaBreakType;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;
import com.tsarit.billing.model.Business;
import com.tsarit.billing.model.Customer;
import com.tsarit.billing.model.Godown;
import com.tsarit.billing.model.GstDetails;
import com.tsarit.billing.model.Product;
import com.tsarit.billing.model.User;
import com.tsarit.billing.model.UserBusiness;
import com.tsarit.billing.model.Invoice;
import com.tsarit.billing.model.InvoiceItems;
import com.tsarit.billing.model.PurchaseReturn;
import com.tsarit.billing.model.PurchaseReturnItem;
import com.tsarit.billing.model.Sale;
import com.tsarit.billing.model.SaleItem;
import com.tsarit.billing.repository.BusinessRepository;
import com.tsarit.billing.repository.GstDetailsRepository;
import com.tsarit.billing.repository.InvoiceItemsRepository;
import com.tsarit.billing.repository.ProductRepository;
import com.tsarit.billing.repository.UserBusinessRepository;
import com.tsarit.billing.repository.UserRepository;

import com.itextpdf.kernel.events.PdfDocumentEvent;
import com.itextpdf.kernel.events.IEventHandler;
import com.itextpdf.kernel.events.Event;
import com.itextpdf.kernel.pdf.PdfPage;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import com.itextpdf.kernel.geom.Rectangle;
import com.itextpdf.layout.Canvas;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class PdfService {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private UserBusinessRepository userBusinessRepository;

	@Autowired
	private GstDetailsRepository gstDetailsRepository;

	@Autowired
	private BusinessRepository businessRepository;

	@Autowired
	private InvoiceItemsRepository invoiceItemsRepository;

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
					"Total Stock ", "Available stock ", "Min Stock", "Barcode", "Tax %", "Discount %",
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
				table.addCell(p.getTotalStock() != null ? p.getTotalStock().toString() : "0");
				table.addCell(p.getRemainingStock() != null ? p.getRemainingStock().toString() : "0");
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
			Table table = new Table(new float[] { 150F, 300F }).setWidth(100);

			addRow(table, "Product Code", nullSafe(product.getProductCode()));
			addRow(table, "Name", nullSafe(product.getProductName()));
			addRow(table, "Category", nullSafe(product.getCategory()));
			addRow(table, "Unit", nullSafe(product.getUnit()));
			addRow(table, "Purchase Price",
					product.getPurchasePrice() != null ? product.getPurchasePrice().toString() : "0.0");
			addRow(table, "Selling Price",
					product.getSellingPrice() != null ? product.getSellingPrice().toString() : "0.0");
			addRow(table, "Total Stock", product.getTotalStock() != null ? product.getTotalStock().toString() : "0");
			addRow(table, "Available Stock",
					product.getRemainingStock() != null ? product.getRemainingStock().toString() : "0");
			addRow(table, "Min Stock Level",
					product.getMinStockLevel() != null ? product.getMinStockLevel().toString() : "0");
			addRow(table, "Barcode", nullSafe(product.getBarcode()));
			addRow(table, "Tax Rate (%)", product.getTaxRate() != null ? product.getTaxRate().toString() : "0.0");
			addRow(table, "Discount (%)", product.getDiscount() != null ? product.getDiscount().toString() : "0.0");
			addRow(table, "Expiry Date",
					product.getExpiryDate() != null ? product.getExpiryDate().format(dateFormatter) : "");
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
		return value != null ? value : ""; // Return empty string instead of null
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
			Optional<GstDetails> gstDetails,
			ProductRepository productRepository) {
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

					Table header = new Table(new float[] { 1, 4 });// 1 row 4 columns
					header.setWidth(UnitValue.createPercentValue(100));

					// Logo
					Cell logoCell = new Cell().setBorder(Border.NO_BORDER);
					if (business.getBusinessLogo() != null) {
						Image logo = new Image(
								ImageDataFactory.create(business.getBusinessLogo()));
						logo.scaleToFit(70, 70); // width and height
						logoCell.add(logo);
					}
					header.addCell(logoCell);

					// Company Info
					Cell infoCell = new Cell().setBorder(Border.NO_BORDER);
					infoCell.add(new Paragraph(business.getBusinessName())
							.setBold().setFontSize(14));
					// infoCell.add(new Paragraph("Business ID : " +
					// business.getId()).setFontSize(10));
					infoCell.add(new Paragraph(
							"User : " + userName).setFontSize(10));
					infoCell.add(new Paragraph("Email : " + nullSafe(business.getEmail())).setFontSize(10));
					infoCell.add(new Paragraph("Contact : " + nullSafe(business.getPhoneNo())).setFontSize(10));
					infoCell.add(new Paragraph(
							"GSTIN : " + gstNo).setFontSize(10));
					header.addCell(infoCell);

					document.add(header);
				}

				document.add(new LineSeparator(new SolidLine()));
				// document.add(new Paragraph("\n"));

				/* ================= REPORT TITLE ================= */
				document.add(new Paragraph("Godown & Inventory Report")
						.setBold()
						.setFontSize(16)
						.setTextAlignment(TextAlignment.CENTER));

				Paragraph datePara = new Paragraph(
						"Date : " + LocalDate.now()
								.format(DateTimeFormatter.ofPattern("dd-MM-yyyy")))
						.setFontSize(10)
						.setTextAlignment(TextAlignment.RIGHT);

				document.add(datePara);
				document.add(new LineSeparator(new SolidLine()));
				document.add(new Paragraph("\n"));

				// document.add(new Paragraph("\n"));

				// document.add(new Paragraph("\n"));
				Paragraph allGodownTitle = new Paragraph("All Godowns Info:")
						.setBold()
						.setUnderline()
						.setFontSize(13);

				document.add(allGodownTitle);
				document.add(new Paragraph("\n"));

				/* ================= GODOWN LOOP ================= */
				for (Godown godown : godowns) {

					/* -------- Godown Info Row -------- */
					Table godownInfo = new Table(new float[] { 3, 3, 4, 3 });
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
							"Godown Name: " + godown.getGodownName() + " - Product Info:")
							.setBold()
							.setUnderline()
							.setFontSize(12);

					document.add(productInfoTitle);
					document.add(new Paragraph("\n"));

					List<Product> products = productRepository.findByGodown_GodownId(godown.getGodownId());

					if (products != null && !products.isEmpty()) {

						Table productTable = new Table(new float[] { 3, 3, 4, 2, 2, 2, 2 });
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
							productTable.addCell(centerCell(p.getTotalStock()));
							productTable.addCell(centerCell(p.getRemainingStock())); // available
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

	// Simplified method signature - no UserBusiness needed
	public byte[] generateCustomerReport(List<Customer> customers, String businessId) {

		try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {

			PdfWriter writer = new PdfWriter(out);
			PdfDocument pdf = new PdfDocument(writer);

			// Fetch business data first
			final Business business = businessRepository.findById(businessId).orElse(null);
			final GstDetails gstDetails = gstDetailsRepository.findByBusiness_Id(businessId).orElse(null);

			final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
			DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");

			// Define professional colors
			final com.itextpdf.kernel.colors.DeviceRgb headerColor = new com.itextpdf.kernel.colors.DeviceRgb(44, 62,
					80); // #2c3e50

			// Add page event handler for header on every page
			pdf.addEventHandler(PdfDocumentEvent.END_PAGE,
					new IEventHandler() {
						@Override
						public void handleEvent(Event event) {
							PdfDocumentEvent docEvent = (PdfDocumentEvent) event;
							PdfDocument pdfDoc = docEvent.getDocument();
							PdfPage page = docEvent.getPage();
							Rectangle pageSize = page.getPageSize();

							PdfCanvas pdfCanvas = new PdfCanvas(
									page.newContentStreamBefore(), page.getResources(), pdfDoc);

							try (Canvas canvas = new Canvas(pdfCanvas, pageSize)) {
								// Create header table
								Table headerTable = new Table(new float[] { 2, 5, 2 });
								headerTable.setWidth(UnitValue.createPercentValue(100));
								headerTable.setFixedPosition(20, pageSize.getTop() - 110, pageSize.getWidth() - 40);

								// Logo Cell
								Cell logoCell = new Cell().setBorder(Border.NO_BORDER);
								if (business != null && business.getBusinessLogo() != null) {
									try {
										Image logo = new Image(ImageDataFactory.create(business.getBusinessLogo()));
										logo.scaleToFit(80, 80);
										logoCell.add(logo);
									} catch (Exception e) {
										logoCell.add(new Paragraph("LOGO").setBold().setFontSize(12));
									}
								} else {
									logoCell.add(new Paragraph("LOGO").setBold().setFontSize(12));
								}
								headerTable.addCell(logoCell);

								// Business Info Cell
								Cell businessInfoCell = new Cell().setBorder(Border.NO_BORDER);
								if (business != null) {
									businessInfoCell.add(new Paragraph(business.getBusinessName())
											.setBold().setFontSize(16).setFontColor(headerColor));
									businessInfoCell.add(
											new Paragraph("Phone: " + nullSafe(business.getPhoneNo())).setFontSize(8));
									businessInfoCell.add(
											new Paragraph("Email: " + nullSafe(business.getEmail())).setFontSize(8));
									businessInfoCell.add(new Paragraph(
											"GSTIN: " + (gstDetails != null ? nullSafe(gstDetails.getGstNo())
													: "Not Registered"))
											.setFontSize(8));
									String address = String.format("%s, %s, %s - %s",
											nullSafe(business.getAddress()),
											nullSafe(business.getCity()),
											nullSafe(business.getState()),
											nullSafe(business.getPincode())).replaceAll(", ,", ",")
											.replaceAll("^, |, $", "");
									businessInfoCell.add(new Paragraph("Address: " + address).setFontSize(8));
								}
								headerTable.addCell(businessInfoCell);

								// Date Cell
								Cell dateCell = new Cell().setBorder(Border.NO_BORDER)
										.setTextAlignment(TextAlignment.RIGHT);
								dateCell.add(
										new Paragraph("Print Date").setBold().setFontSize(9).setFontColor(headerColor));
								dateCell.add(
										new Paragraph(LocalDate.now().format(dateFormatter)).setFontSize(11).setBold());
								headerTable.addCell(dateCell);

								canvas.add(headerTable);

								// Add separator line
								canvas.add(new LineSeparator(new SolidLine(2))
										.setFixedPosition(20, pageSize.getTop() - 115, pageSize.getWidth() - 40));
							}
						}
					});

			Document document = new Document(pdf, PageSize.A4);

			// Adjust top margin to accommodate header (110px header + 10px separator + 10px
			// spacing)
			document.setMargins(130, 20, 20, 20);

			/* ================= DOCUMENT TITLE ================= */
			document.add(new Paragraph("PARTIES REPORT")
					.setBold()
					.setFontSize(16)
					.setTextAlignment(TextAlignment.CENTER)
					.setFontColor(headerColor)
					.setMarginBottom(15));

			/* ================= SUMMARY SECTION ================= */
			// Calculate summary statistics
			long totalCustomers = customers.stream()
					.filter(c -> "Customer".equalsIgnoreCase(c.getCustomerType()))
					.count();
			long totalSuppliers = customers.stream()
					.filter(c -> "Supplier".equalsIgnoreCase(c.getCustomerType()))
					.count();
			long totalBoth = customers.stream()
					.filter(c -> "Both".equalsIgnoreCase(c.getCustomerType()))
					.count();

			Table summaryTable = new Table(new float[] { 3, 3, 3, 3 });
			summaryTable.setWidth(UnitValue.createPercentValue(100));

			// Summary headers with bold borders
			summaryTable.addHeaderCell(new Cell()
					.add(new Paragraph("Total Parties").setBold().setFontSize(10))
					.setBackgroundColor(headerColor)
					.setFontColor(ColorConstants.WHITE)
					.setBorder(new SolidBorder(headerColor, 2))
					.setTextAlignment(TextAlignment.CENTER)
					.setPadding(6));
			summaryTable.addHeaderCell(new Cell()
					.add(new Paragraph("Customers").setBold().setFontSize(10))
					.setBackgroundColor(headerColor)
					.setFontColor(ColorConstants.WHITE)
					.setBorder(new SolidBorder(headerColor, 2))
					.setTextAlignment(TextAlignment.CENTER)
					.setPadding(6));
			summaryTable.addHeaderCell(new Cell()
					.add(new Paragraph("Suppliers").setBold().setFontSize(10))
					.setBackgroundColor(headerColor)
					.setFontColor(ColorConstants.WHITE)
					.setBorder(new SolidBorder(headerColor, 2))
					.setTextAlignment(TextAlignment.CENTER)
					.setPadding(6));
			summaryTable.addHeaderCell(new Cell()
					.add(new Paragraph("Both").setBold().setFontSize(10))
					.setBackgroundColor(headerColor)
					.setFontColor(ColorConstants.WHITE)
					.setBorder(new SolidBorder(headerColor, 2))
					.setTextAlignment(TextAlignment.CENTER)
					.setPadding(6));

			// Summary data with bold borders
			summaryTable.addCell(new Cell()
					.add(new Paragraph(String.valueOf(customers.size())).setFontSize(9))
					.setBorder(new SolidBorder(headerColor, 2))
					.setTextAlignment(TextAlignment.CENTER)
					.setPadding(5));
			summaryTable.addCell(new Cell()
					.add(new Paragraph(String.valueOf(totalCustomers)).setFontSize(9))
					.setBorder(new SolidBorder(headerColor, 2))
					.setTextAlignment(TextAlignment.CENTER)
					.setPadding(5));
			summaryTable.addCell(new Cell()
					.add(new Paragraph(String.valueOf(totalSuppliers)).setFontSize(9))
					.setBorder(new SolidBorder(headerColor, 2))
					.setTextAlignment(TextAlignment.CENTER)
					.setPadding(5));
			summaryTable.addCell(new Cell()
					.add(new Paragraph(String.valueOf(totalBoth)).setFontSize(9))
					.setBorder(new SolidBorder(headerColor, 2))
					.setTextAlignment(TextAlignment.CENTER)
					.setPadding(5));

			document.add(summaryTable);
			document.add(new Paragraph("\n").setFontSize(8));

			/* ================= SEPARATE TABLES BY PARTY TYPE ================= */

			// Filter parties by type
			List<Customer> customersOnly = customers.stream()
					.filter(c -> "Customer".equalsIgnoreCase(c.getCustomerType()))
					.collect(Collectors.toList());
			List<Customer> suppliersOnly = customers.stream()
					.filter(c -> "Supplier".equalsIgnoreCase(c.getCustomerType()))
					.collect(Collectors.toList());
			List<Customer> bothType = customers.stream()
					.filter(c -> "Both".equalsIgnoreCase(c.getCustomerType()))
					.collect(Collectors.toList());

			// Table headers (without Customer Type column since it's implied by section)
			String[] headers = { "Party ID", "Party Name", "Phone", "City", "Status" };

			/* ================= CUSTOMERS TABLE ================= */
			if (!customersOnly.isEmpty()) {
				document.add(new Paragraph("Customers:")
						.setBold()
						.setFontSize(12)
						.setFontColor(headerColor)
						.setMarginTop(5)
						.setMarginBottom(8));

				Table customersTable = new Table(new float[] { 2, 4, 3, 2, 2 });
				customersTable.setWidth(UnitValue.createPercentValue(100));

				// Headers
				for (String header : headers) {
					customersTable.addHeaderCell(new Cell()
							.add(new Paragraph(header).setBold().setFontSize(9))
							.setBackgroundColor(headerColor)
							.setFontColor(ColorConstants.WHITE)
							.setBorder(new SolidBorder(headerColor, 2))
							.setTextAlignment(TextAlignment.CENTER)
							.setPadding(5));
				}

				// Data rows
				for (Customer customer : customersOnly) {
					customersTable.addCell(new Cell()
							.add(new Paragraph(customer.getId() != null ? customer.getId().toString() : "-")
									.setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 2))
							.setPadding(4));
					customersTable.addCell(new Cell()
							.add(new Paragraph(customer.getName() != null ? customer.getName() : "-").setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 2))
							.setPadding(4));
					customersTable.addCell(new Cell()
							.add(new Paragraph(customer.getPhone() != null ? customer.getPhone() : "-").setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 2))
							.setPadding(4));
					customersTable.addCell(new Cell()
							.add(new Paragraph(customer.getCity() != null ? customer.getCity() : "-").setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 2))
							.setPadding(4));
					customersTable.addCell(new Cell()
							.add(new Paragraph(customer.getStatus() != null ? customer.getStatus().toString() : "-")
									.setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 2))
							.setTextAlignment(TextAlignment.CENTER)
							.setPadding(4));
				}
				document.add(customersTable);
				document.add(new Paragraph("\n").setFontSize(6));
			}

			/* ================= SUPPLIERS TABLE ================= */
			if (!suppliersOnly.isEmpty()) {
				document.add(new Paragraph("Suppliers:")
						.setBold()
						.setFontSize(12)
						.setFontColor(headerColor)
						.setMarginTop(5)
						.setMarginBottom(8));

				Table suppliersTable = new Table(new float[] { 2, 4, 3, 2, 2 });
				suppliersTable.setWidth(UnitValue.createPercentValue(100));

				// Headers
				for (String header : headers) {
					suppliersTable.addHeaderCell(new Cell()
							.add(new Paragraph(header).setBold().setFontSize(9))
							.setBackgroundColor(headerColor)
							.setFontColor(ColorConstants.WHITE)
							.setBorder(new SolidBorder(headerColor, 2))
							.setTextAlignment(TextAlignment.CENTER)
							.setPadding(5));
				}

				// Data rows
				for (Customer supplier : suppliersOnly) {
					suppliersTable.addCell(new Cell()
							.add(new Paragraph(supplier.getId() != null ? supplier.getId().toString() : "-")
									.setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 2))
							.setPadding(4));
					suppliersTable.addCell(new Cell()
							.add(new Paragraph(supplier.getName() != null ? supplier.getName() : "-").setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 2))
							.setPadding(4));
					suppliersTable.addCell(new Cell()
							.add(new Paragraph(supplier.getPhone() != null ? supplier.getPhone() : "-").setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 2))
							.setPadding(4));
					suppliersTable.addCell(new Cell()
							.add(new Paragraph(supplier.getCity() != null ? supplier.getCity() : "-").setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 2))
							.setPadding(4));
					suppliersTable.addCell(new Cell()
							.add(new Paragraph(supplier.getStatus() != null ? supplier.getStatus().toString() : "-")
									.setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 2))
							.setTextAlignment(TextAlignment.CENTER)
							.setPadding(4));
				}
				document.add(suppliersTable);
				document.add(new Paragraph("\n").setFontSize(6));
			}

			/* ================= BOTH (CUSTOMER & SUPPLIER) TABLE ================= */
			if (!bothType.isEmpty()) {
				document.add(new Paragraph("Both (Customer & Supplier):")
						.setBold()
						.setFontSize(12)
						.setFontColor(headerColor)
						.setMarginTop(5)
						.setMarginBottom(8));

				Table bothTable = new Table(new float[] { 2, 4, 3, 2, 2 });
				bothTable.setWidth(UnitValue.createPercentValue(100));

				// Headers
				for (String header : headers) {
					bothTable.addHeaderCell(new Cell()
							.add(new Paragraph(header).setBold().setFontSize(9))
							.setBackgroundColor(headerColor)
							.setFontColor(ColorConstants.WHITE)
							.setBorder(new SolidBorder(headerColor, 2))
							.setTextAlignment(TextAlignment.CENTER)
							.setPadding(5));
				}

				// Data rows
				for (Customer both : bothType) {
					bothTable.addCell(new Cell()
							.add(new Paragraph(both.getId() != null ? both.getId().toString() : "-").setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 2))
							.setPadding(4));
					bothTable.addCell(new Cell()
							.add(new Paragraph(both.getName() != null ? both.getName() : "-").setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 2))
							.setPadding(4));
					bothTable.addCell(new Cell()
							.add(new Paragraph(both.getPhone() != null ? both.getPhone() : "-").setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 2))
							.setPadding(4));
					bothTable.addCell(new Cell()
							.add(new Paragraph(both.getCity() != null ? both.getCity() : "-").setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 2))
							.setPadding(4));
					bothTable.addCell(new Cell()
							.add(new Paragraph(both.getStatus() != null ? both.getStatus().toString() : "-")
									.setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 2))
							.setTextAlignment(TextAlignment.CENTER)
							.setPadding(4));
				}
				document.add(bothTable);
				document.add(new Paragraph("\n").setFontSize(6));
			}

			// Show message if no parties at all
			if (customers == null || customers.isEmpty()) {
				document.add(new Paragraph("No parties found for this business")
						.setItalic()
						.setFontSize(10));
			}

			document.add(new Paragraph("\n"));

			/* ================= FOOTER ================= */
			document.add(new LineSeparator(new SolidLine()));
			Paragraph footer = new Paragraph(
					"Generated on: " + LocalDateTime.now().format(dateTimeFormatter))
					.setFontSize(8)
					.setTextAlignment(TextAlignment.CENTER)
					.setItalic();
			document.add(footer);

			document.close();
			return out.toByteArray();
		} catch (Exception e) {
			e.printStackTrace();
			return new byte[0];
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

	/**
	 * Generate PDF report for Purchase Invoices that have been added to returns
	 */
	public byte[] generatePurchaseInvoicesPdf(List<Invoice> invoices, List<InvoiceItems> allItems, String businessId) {
		try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			PdfWriter writer = new PdfWriter(out);
			PdfDocument pdf = new PdfDocument(writer);
			Document document = new Document(pdf, PageSize.A4);
			document.setMargins(25, 25, 25, 25);

			DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");

			/* ================= REPORT TITLE ================= */
			document.add(new Paragraph("Purchase Invoices Report")
					.setBold()
					.setFontSize(18)
					.setTextAlignment(TextAlignment.CENTER));

			Paragraph datePara = new Paragraph(
					"Business ID: " + businessId + " | Date: " +
							LocalDate.now().format(dateFormatter))
					.setFontSize(10)
					.setTextAlignment(TextAlignment.CENTER);
			document.add(datePara);
			document.add(new LineSeparator(new SolidLine()));
			document.add(new Paragraph("\n"));

			/* ================= SUMMARY SECTION ================= */
			Paragraph summaryTitle = new Paragraph("Summary:")
					.setBold()
					.setUnderline()
					.setFontSize(13);
			document.add(summaryTitle);

			// Calculate summary statistics
			int totalInvoices = invoices.size();
			int totalItems = invoices.stream()
					.mapToInt(Invoice::getTotalItems)
					.sum();
			double totalAmount = invoices.stream()
					.mapToDouble(Invoice::getTotalAmount)
					.sum();

			Table summaryTable = new Table(new float[] { 3, 3, 3 });
			summaryTable.setWidth(UnitValue.createPercentValue(100));

			summaryTable.addHeaderCell(headerCell("Total Invoices"));
			summaryTable.addHeaderCell(headerCell("Total Items"));
			summaryTable.addHeaderCell(headerCell("Total Amount (₹)"));

			summaryTable.addCell(centerCell(totalInvoices));
			summaryTable.addCell(centerCell(totalItems));
			summaryTable.addCell(centerCell(String.format("%.2f", totalAmount)));

			document.add(summaryTable);
			document.add(new Paragraph("\n"));

			/* ================= ALL INVOICES SECTION ================= */
			Paragraph allInvoicesTitle = new Paragraph("Purchase Invoices Details:")
					.setBold()
					.setUnderline()
					.setFontSize(13);
			document.add(allInvoicesTitle);
			document.add(new Paragraph("\n"));

			if (invoices != null && !invoices.isEmpty()) {
				int invoiceSerialNo = 1;
				for (Invoice invoice : invoices) {
					// Invoice Header Table with Sr. No.
					Table invoiceHeader = new Table(new float[] { 1, 2, 3, 2, 2, 2 });
					invoiceHeader.setWidth(UnitValue.createPercentValue(100));

					invoiceHeader.addHeaderCell(headerCell("Sr. No."));
					invoiceHeader.addHeaderCell(headerCell("Invoice ID"));
					invoiceHeader.addHeaderCell(headerCell("Supplier Name"));
					invoiceHeader.addHeaderCell(headerCell("Date"));
					invoiceHeader.addHeaderCell(headerCell("Total Items"));
					invoiceHeader.addHeaderCell(headerCell("Amount (₹)"));

					String invoiceIdShort = invoice.getInvoiceId() != null
							? invoice.getInvoiceId().substring(0, Math.min(8, invoice.getInvoiceId().length()))
							: "N/A";
					String supplierName = invoice.getCustomer() != null ? invoice.getCustomer().getName() : "N/A";

					invoiceHeader.addCell(centerCell(invoiceSerialNo++));
					invoiceHeader.addCell(bodyCell(invoiceIdShort));
					invoiceHeader.addCell(bodyCell(supplierName));
					invoiceHeader.addCell(bodyCell(invoice.getInvoiceDate()));
					invoiceHeader.addCell(centerCell(invoice.getTotalItems()));
					invoiceHeader.addCell(centerCell(String.format("%.2f", invoice.getTotalAmount())));

					document.add(invoiceHeader);

					// Items Table for this invoice with Sr. No.
					List<InvoiceItems> invoiceItems = allItems.stream()
							.filter(item -> item.getInvoice() != null &&
									invoice.getInvoiceId().equals(item.getInvoice().getInvoiceId()))
							.collect(Collectors.toList());

					if (!invoiceItems.isEmpty()) {
						document.add(new Paragraph("Items:").setBold().setFontSize(11));

						Table itemsTable = new Table(new float[] { 1, 3, 1, 2, 1, 1, 2 });
						itemsTable.setWidth(UnitValue.createPercentValue(100));

						itemsTable.addHeaderCell(headerCell("Sr. No."));
						itemsTable.addHeaderCell(headerCell("Item Name"));
						itemsTable.addHeaderCell(headerCell("Qty"));
						itemsTable.addHeaderCell(headerCell("Price"));
						itemsTable.addHeaderCell(headerCell("Tax %"));
						itemsTable.addHeaderCell(headerCell("Disc %"));
						itemsTable.addHeaderCell(headerCell("Total"));

						int itemSerialNo = 1;
						for (InvoiceItems item : invoiceItems) {
							itemsTable.addCell(centerCell(itemSerialNo++));
							itemsTable.addCell(bodyCell(item.getItemName()));
							itemsTable.addCell(centerCell(item.getQty()));
							itemsTable.addCell(centerCell(String.format("%.2f", item.getPrice())));
							itemsTable.addCell(centerCell(String.format("%.2f", item.getTax())));
							itemsTable.addCell(centerCell(String.format("%.2f", item.getDiscount())));
							itemsTable.addCell(centerCell(String.format("%.2f", item.getTotalLineAmount())));
						}

						document.add(itemsTable);
					}

					document.add(new Paragraph("\n"));
					document.add(new LineSeparator(new SolidLine()));
					document.add(new Paragraph("\n"));
				}
			} else {
				document.add(new Paragraph("No purchase invoices found")
						.setItalic()
						.setFontSize(10));
			}

			/* ================= FOOTER ================= */
			document.add(new LineSeparator(new SolidLine()));
			Paragraph footer = new Paragraph(
					"Generated on: " + LocalDateTime.now()
							.format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss")))
					.setFontSize(8)
					.setTextAlignment(TextAlignment.CENTER)
					.setItalic();
			document.add(footer);

			document.close();
			return out.toByteArray();
		} catch (Exception e) {
			e.printStackTrace();
			return new byte[0];
		}
	}

	/**
	 * Generate PDF report for Purchase Returns with Professional Styling
	 */
	public byte[] generatePurchaseReturnsPdf(List<PurchaseReturn> returns, String businessId) {
		try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			PdfWriter writer = new PdfWriter(out);
			PdfDocument pdf = new PdfDocument(writer);
			Document document = new Document(pdf, PageSize.A4);

			// Page margins
			document.setMargins(20, 20, 20, 20);

			DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
			DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");

			// Fetch business data
			Business business = businessRepository.findById(businessId).orElse(null);
			GstDetails gstDetails = gstDetailsRepository.findByBusiness_Id(businessId).orElse(null);

			// Define professional colors
			com.itextpdf.kernel.colors.DeviceRgb headerColor = new com.itextpdf.kernel.colors.DeviceRgb(44, 62, 80); // #2c3e50

			/* ================= BUSINESS HEADER WITH LOGO ================= */
			Table headerTable = new Table(new float[] { 2, 5, 2 });
			headerTable.setWidth(UnitValue.createPercentValue(100));

			// Logo Cell
			Cell logoCell = new Cell().setBorder(Border.NO_BORDER);
			if (business != null && business.getBusinessLogo() != null) {
				try {
					Image logo = new Image(ImageDataFactory.create(business.getBusinessLogo()));
					logo.scaleToFit(100, 100);
					logoCell.add(logo);
				} catch (Exception e) {
					logoCell.add(new Paragraph("LOGO").setBold().setFontSize(14));
				}
			} else {
				logoCell.add(new Paragraph("LOGO").setBold().setFontSize(14));
			}
			headerTable.addCell(logoCell);

			// Business Info Cell
			Cell businessInfoCell = new Cell().setBorder(Border.NO_BORDER);
			if (business != null) {
				businessInfoCell.add(new Paragraph(business.getBusinessName())
						.setBold().setFontSize(20).setFontColor(headerColor));
				businessInfoCell.add(new Paragraph("Phone: " + nullSafe(business.getPhoneNo())).setFontSize(9));
				businessInfoCell.add(new Paragraph("Email: " + nullSafe(business.getEmail())).setFontSize(9));
				businessInfoCell.add(new Paragraph(
						"GSTIN: " + (gstDetails != null ? nullSafe(gstDetails.getGstNo()) : "Not Registered"))
						.setFontSize(9));
				String address = String.format("%s, %s, %s - %s",
						nullSafe(business.getAddress()),
						nullSafe(business.getCity()),
						nullSafe(business.getState()),
						nullSafe(business.getPincode())).replaceAll(", ,", ",").replaceAll("^, |, $", "");
				businessInfoCell.add(new Paragraph("Address: " + address).setFontSize(9));
			}
			headerTable.addCell(businessInfoCell);

			// Date Cell
			Cell dateCell = new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT);
			dateCell.add(new Paragraph("Print Date").setBold().setFontSize(10).setFontColor(headerColor));
			dateCell.add(new Paragraph(LocalDate.now().format(dateFormatter)).setFontSize(12).setBold());
			headerTable.addCell(dateCell);

			document.add(headerTable);
			document.add(new LineSeparator(new SolidLine(3)).setMarginTop(10).setMarginBottom(10));

			/* ================= DOCUMENT TITLE ================= */
			document.add(new Paragraph("PURCHASE RETURN DOCUMENT")
					.setBold()
					.setFontSize(16)
					.setTextAlignment(TextAlignment.CENTER)
					.setFontColor(headerColor)
					.setMarginBottom(15));

			/* ================= SUMMARY SECTION ================= */
			int totalReturns = returns.size();
			int totalItems = returns.stream()
					.mapToInt(pr -> pr.getItems() != null ? pr.getItems().size() : 0)
					.sum();
			BigDecimal totalAmount = returns.stream()
					.map(pr -> pr.getItems() != null ? pr.getItems().stream()
							.map(PurchaseReturnItem::getTotalAmount)
							.reduce(BigDecimal.ZERO, BigDecimal::add)
							: BigDecimal.ZERO)
					.reduce(BigDecimal.ZERO, BigDecimal::add);
			long overdueReturns = returns.stream()
					.filter(pr -> "NOT_RECEIVED".equals(pr.getStatus()))
					.count();

			Table summaryTable = new Table(new float[] { 3, 3, 3, 3 });
			summaryTable.setWidth(UnitValue.createPercentValue(100));

			// Summary headers with bold borders
			summaryTable.addHeaderCell(new Cell()
					.add(new Paragraph("Total Returns").setBold().setFontSize(10))
					.setBackgroundColor(headerColor)
					.setFontColor(ColorConstants.WHITE)
					.setBorder(new SolidBorder(headerColor, 2))
					.setTextAlignment(TextAlignment.CENTER)
					.setPadding(6));
			summaryTable.addHeaderCell(new Cell()
					.add(new Paragraph("Total Items").setBold().setFontSize(10))
					.setBackgroundColor(headerColor)
					.setFontColor(ColorConstants.WHITE)
					.setBorder(new SolidBorder(headerColor, 2))
					.setTextAlignment(TextAlignment.CENTER)
					.setPadding(6));
			summaryTable.addHeaderCell(new Cell()
					.add(new Paragraph("Total Amount (₹)").setBold().setFontSize(10))
					.setBackgroundColor(headerColor)
					.setFontColor(ColorConstants.WHITE)
					.setBorder(new SolidBorder(headerColor, 2))
					.setTextAlignment(TextAlignment.CENTER)
					.setPadding(6));
			summaryTable.addHeaderCell(new Cell()
					.add(new Paragraph("Overdue Returns").setBold().setFontSize(10))
					.setBackgroundColor(headerColor)
					.setFontColor(ColorConstants.WHITE)
					.setBorder(new SolidBorder(headerColor, 2))
					.setTextAlignment(TextAlignment.CENTER)
					.setPadding(6));

			// Summary data with bold borders
			summaryTable.addCell(new Cell()
					.add(new Paragraph(String.valueOf(totalReturns)).setFontSize(9))
					.setBorder(new SolidBorder(headerColor, 2))
					.setTextAlignment(TextAlignment.CENTER)
					.setPadding(5));
			summaryTable.addCell(new Cell()
					.add(new Paragraph(String.valueOf(totalItems)).setFontSize(9))
					.setBorder(new SolidBorder(headerColor, 2))
					.setTextAlignment(TextAlignment.CENTER)
					.setPadding(5));
			summaryTable.addCell(new Cell()
					.add(new Paragraph(totalAmount.toString()).setFontSize(9))
					.setBorder(new SolidBorder(headerColor, 2))
					.setTextAlignment(TextAlignment.CENTER)
					.setPadding(5));
			summaryTable.addCell(new Cell()
					.add(new Paragraph(String.valueOf(overdueReturns)).setFontSize(9))
					.setBorder(new SolidBorder(headerColor, 2))
					.setTextAlignment(TextAlignment.CENTER)
					.setPadding(5));

			document.add(summaryTable);
			document.add(new Paragraph("\n").setFontSize(8));

			/* ================= ALL RETURNS SECTION ================= */
			document.add(new Paragraph("Purchase Returns Details:")
					.setBold()
					.setFontSize(13)
					.setFontColor(headerColor)
					.setMarginBottom(10));

			if (returns != null && !returns.isEmpty()) {
				for (PurchaseReturn pr : returns) {
					// Return Header Table with bold borders
					Table returnHeader = new Table(new float[] { 2, 2, 3, 2, 2, 2 });
					returnHeader.setWidth(UnitValue.createPercentValue(100));

					// Headers
					String[] headers = { "Return ID", "Return Date", "Supplier", "Invoice No", "Status",
							"Received At" };
					for (String header : headers) {
						returnHeader.addHeaderCell(new Cell()
								.add(new Paragraph(header).setBold().setFontSize(9))
								.setBackgroundColor(headerColor)
								.setFontColor(ColorConstants.WHITE)
								.setBorder(new SolidBorder(headerColor, 2))
								.setTextAlignment(TextAlignment.CENTER)
								.setPadding(5));
					}

					// Data
					String returnIdShort = pr.getId() != null
							? pr.getId().substring(0, Math.min(8, pr.getId().length()))
							: "N/A";
					String supplierName = "N/A";
					String invoiceNo = "-";

					if (pr.getInvoice() != null) {
						if (pr.getInvoice().getCustomer() != null) {
							supplierName = pr.getInvoice().getCustomer().getName();
						}
						if (pr.getInvoice().getInvoiceId() != null) {
							invoiceNo = "#" + pr.getInvoice().getInvoiceId().substring(0,
									Math.min(8, pr.getInvoice().getInvoiceId().length()));
						}
					}

					returnHeader.addCell(new Cell()
							.add(new Paragraph(returnIdShort).setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 2))
							.setPadding(4));
					returnHeader.addCell(new Cell()
							.add(new Paragraph(
									pr.getReturnDate() != null ? pr.getReturnDate().format(dateFormatter) : "-")
									.setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 2))
							.setPadding(4));
					returnHeader.addCell(new Cell()
							.add(new Paragraph(supplierName).setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 2))
							.setPadding(4));
					returnHeader.addCell(new Cell()
							.add(new Paragraph(invoiceNo).setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 2))
							.setPadding(4));
					returnHeader.addCell(new Cell()
							.add(new Paragraph(pr.getStatus()).setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 2))
							.setTextAlignment(TextAlignment.CENTER)
							.setPadding(4));
					returnHeader.addCell(new Cell()
							.add(new Paragraph(
									pr.getReceivedAt() != null ? pr.getReceivedAt().format(dateTimeFormatter) : "-")
									.setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 2))
							.setPadding(4));

					document.add(returnHeader);

					// Items Table with bold borders
					if (pr.getItems() != null && !pr.getItems().isEmpty()) {
						document.add(new Paragraph("Returned Items:").setBold().setFontSize(10).setMarginTop(5));

						Table itemsTable = new Table(new float[] { 3, 1, 2, 1, 1, 2, 3 });
						itemsTable.setWidth(UnitValue.createPercentValue(100));

						// Item headers
						String[] itemHeaders = { "Item Name", "Qty", "Price", "Tax %", "Disc %", "Total",
								"Return Reason" };
						for (String header : itemHeaders) {
							itemsTable.addHeaderCell(new Cell()
									.add(new Paragraph(header).setBold().setFontSize(8))
									.setBackgroundColor(headerColor)
									.setFontColor(ColorConstants.WHITE)
									.setBorder(new SolidBorder(headerColor, 2))
									.setTextAlignment(TextAlignment.CENTER)
									.setPadding(4));
						}

						// Item data
						for (PurchaseReturnItem item : pr.getItems()) {
							itemsTable.addCell(new Cell()
									.add(new Paragraph(item.getItemName()).setFontSize(8))
									.setBorder(new SolidBorder(headerColor, 2))
									.setPadding(3));
							itemsTable.addCell(new Cell()
									.add(new Paragraph(String.valueOf(item.getQuantityReturned())).setFontSize(8))
									.setBorder(new SolidBorder(headerColor, 2))
									.setTextAlignment(TextAlignment.CENTER)
									.setPadding(3));
							itemsTable.addCell(new Cell()
									.add(new Paragraph(item.getPrice() != null ? item.getPrice().toString() : "0")
											.setFontSize(8))
									.setBorder(new SolidBorder(headerColor, 2))
									.setTextAlignment(TextAlignment.CENTER)
									.setPadding(3));
							itemsTable.addCell(new Cell()
									.add(new Paragraph(item.getTax() != null ? item.getTax().toString() : "0")
											.setFontSize(8))
									.setBorder(new SolidBorder(headerColor, 2))
									.setTextAlignment(TextAlignment.CENTER)
									.setPadding(3));
							itemsTable.addCell(new Cell()
									.add(new Paragraph(item.getDiscount() != null ? item.getDiscount().toString() : "0")
											.setFontSize(8))
									.setBorder(new SolidBorder(headerColor, 2))
									.setTextAlignment(TextAlignment.CENTER)
									.setPadding(3));
							itemsTable.addCell(new Cell()
									.add(new Paragraph(
											item.getTotalAmount() != null ? item.getTotalAmount().toString() : "0")
											.setFontSize(8).setBold())
									.setBorder(new SolidBorder(headerColor, 2))
									.setTextAlignment(TextAlignment.CENTER)
									.setPadding(3));
							itemsTable.addCell(new Cell()
									.add(new Paragraph(item.getReturnReason() != null ? item.getReturnReason() : "-")
											.setFontSize(8))
									.setBorder(new SolidBorder(headerColor, 2))
									.setPadding(3));
						}

						document.add(itemsTable);
					}

					document.add(new Paragraph("\n").setFontSize(6));
					document.add(new LineSeparator(new SolidLine(1)));
					document.add(new Paragraph("\n").setFontSize(6));
				}
			} else {
				document.add(new Paragraph("No purchase returns found")
						.setItalic()
						.setFontSize(10));
			}

			/* ================= FOOTER WITH SIGNATURE AND NOTES ================= */
			document.add(new LineSeparator(new SolidLine(1)).setMarginTop(15));

			Table footerTable = new Table(new float[] { 1, 1 });
			footerTable.setWidth(UnitValue.createPercentValue(100));

			// Signature Cell
			Cell signatureCell = new Cell().setBorder(Border.NO_BORDER);
			if (business != null && business.getSignature() != null) {
				try {
					Image signature = new Image(ImageDataFactory.create(business.getSignature()));
					signature.scaleToFit(150, 80);
					signatureCell.add(signature);
				} catch (Exception e) {
					// Signature image failed to load
				}
			}
			signatureCell.add(new Paragraph("_________________________").setMarginTop(5));
			signatureCell.add(new Paragraph("Authorized Signature").setBold().setFontSize(9).setFontColor(headerColor));
			signatureCell
					.add(new Paragraph(business != null ? business.getBusinessName() : "Business Name").setFontSize(8));
			footerTable.addCell(signatureCell);

			// Notes Cell
			Cell notesCell = new Cell()
					.setBorder(new SolidBorder(headerColor, 2))
					.setBackgroundColor(new com.itextpdf.kernel.colors.DeviceRgb(248, 249, 250));
			notesCell.add(new Paragraph("Notes").setBold().setFontSize(11).setFontColor(headerColor)
					.setBorderBottom(new SolidBorder(headerColor, 2)).setPaddingBottom(5));
			notesCell.add(new Paragraph("Additional notes or remarks can be added here...")
					.setFontSize(8).setItalic().setMarginTop(5));
			footerTable.addCell(notesCell);

			document.add(footerTable);

			// Print timestamp
			document.add(new Paragraph("Printed: " + LocalDateTime.now()
					.format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss")))
					.setFontSize(7)
					.setTextAlignment(TextAlignment.CENTER)
					.setMarginTop(10)
					.setItalic());

			document.close();
			return out.toByteArray();
		} catch (Exception e) {
			e.printStackTrace();
			return new byte[0];
		}
	}

	/**
	 * Generate PDF for a single Purchase Invoice with Professional Styling
	 */
	public byte[] generateSinglePurchaseInvoicePdf(Invoice invoice, List<InvoiceItems> items, String businessId) {
		try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			PdfWriter writer = new PdfWriter(out);
			PdfDocument pdf = new PdfDocument(writer);
			Document document = new Document(pdf, PageSize.A4);

			// Page margins
			document.setMargins(20, 20, 20, 20);

			DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");

			// Fetch business data
			Business business = businessRepository.findById(businessId).orElse(null);
			GstDetails gstDetails = gstDetailsRepository.findByBusiness_Id(businessId).orElse(null);

			// Define professional colors
			com.itextpdf.kernel.colors.DeviceRgb headerColor = new com.itextpdf.kernel.colors.DeviceRgb(44, 62, 80); // #2c3e50

			/* ================= BUSINESS HEADER WITH LOGO ================= */
			Table headerTable = new Table(new float[] { 2, 5, 2 });
			headerTable.setWidth(UnitValue.createPercentValue(100));

			// Logo Cell
			Cell logoCell = new Cell().setBorder(Border.NO_BORDER);
			if (business != null && business.getBusinessLogo() != null) {
				try {
					Image logo = new Image(ImageDataFactory.create(business.getBusinessLogo()));
					logo.scaleToFit(100, 100);
					logoCell.add(logo);
				} catch (Exception e) {
					logoCell.add(new Paragraph("LOGO").setBold().setFontSize(14));
				}
			} else {
				logoCell.add(new Paragraph("LOGO").setBold().setFontSize(14));
			}
			headerTable.addCell(logoCell);

			// Business Info Cell
			Cell businessInfoCell = new Cell().setBorder(Border.NO_BORDER);
			if (business != null) {
				businessInfoCell.add(new Paragraph(business.getBusinessName())
						.setBold().setFontSize(20).setFontColor(headerColor));
				businessInfoCell.add(new Paragraph("Phone: " + nullSafe(business.getPhoneNo())).setFontSize(9));
				businessInfoCell.add(new Paragraph("Email: " + nullSafe(business.getEmail())).setFontSize(9));
				businessInfoCell.add(new Paragraph(
						"GSTIN: " + (gstDetails != null ? nullSafe(gstDetails.getGstNo()) : "Not Registered"))
						.setFontSize(9));
				String address = String.format("%s, %s, %s - %s",
						nullSafe(business.getAddress()),
						nullSafe(business.getCity()),
						nullSafe(business.getState()),
						nullSafe(business.getPincode())).replaceAll(", ,", ",").replaceAll("^, |, $", "");
				businessInfoCell.add(new Paragraph("Address: " + address).setFontSize(9));
			}
			headerTable.addCell(businessInfoCell);

			// Date Cell
			Cell dateCell = new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT);
			dateCell.add(new Paragraph("Invoice Date").setBold().setFontSize(10).setFontColor(headerColor));
			dateCell.add(new Paragraph(
					invoice.getInvoiceDate() != null ? invoice.getInvoiceDate().formatted(dateFormatter) : "N/A")
					.setFontSize(12).setBold());
			headerTable.addCell(dateCell);

			document.add(headerTable);
			document.add(new LineSeparator(new SolidLine(3)).setMarginTop(10).setMarginBottom(10));

			/* ================= DOCUMENT TITLE ================= */
			document.add(new Paragraph("PURCHASE INVOICE")
					.setBold()
					.setFontSize(16)
					.setTextAlignment(TextAlignment.CENTER)
					.setFontColor(headerColor)
					.setMarginBottom(15));

			/* ================= INVOICE DETAILS ================= */
			Table infoTable = new Table(new float[] { 3, 3, 3, 3 });
			infoTable.setWidth(UnitValue.createPercentValue(100));
			infoTable.setMarginBottom(15);

			// Invoice ID
			infoTable.addCell(new Cell()
					.add(new Paragraph("Invoice ID").setBold().setFontSize(9))
					.setBackgroundColor(new com.itextpdf.kernel.colors.DeviceRgb(248, 249, 250))
					.setBorder(new SolidBorder(headerColor, 1))
					.setPadding(5));
			infoTable.addCell(new Cell()
					.add(new Paragraph(invoice.getInvoiceId() != null ? invoice.getInvoiceId() : "N/A")
							.setFontSize(7))
					.setBorder(new SolidBorder(headerColor, 1))
					.setPadding(5));

			// Supplier Name
			infoTable.addCell(new Cell()
					.add(new Paragraph("Supplier").setBold().setFontSize(9))
					.setBackgroundColor(new com.itextpdf.kernel.colors.DeviceRgb(248, 249, 250))
					.setBorder(new SolidBorder(headerColor, 1))
					.setPadding(5));
			infoTable.addCell(new Cell()
					.add(new Paragraph(invoice.getCustomer() != null ? invoice.getCustomer().getName() : "N/A")
							.setFontSize(9))
					.setBorder(new SolidBorder(headerColor, 1))
					.setPadding(5));

			// Total Items
			infoTable.addCell(new Cell()
					.add(new Paragraph("Total Items").setBold().setFontSize(9))
					.setBackgroundColor(new com.itextpdf.kernel.colors.DeviceRgb(248, 249, 250))
					.setBorder(new SolidBorder(headerColor, 1))
					.setPadding(5));
			infoTable.addCell(new Cell()
					.add(new Paragraph(String.valueOf(items.size())).setFontSize(9))
					.setBorder(new SolidBorder(headerColor, 1))
					.setPadding(5));

			// Total Amount
			BigDecimal totalAmount = items.stream()
					.map(item -> {
						BigDecimal baseAmount = BigDecimal.valueOf(item.getQty())
								.multiply(BigDecimal.valueOf(item.getPrice()));
						BigDecimal taxAmount = baseAmount.multiply(BigDecimal.valueOf(item.getTax()))
								.divide(BigDecimal.valueOf(100));
						BigDecimal discountAmount = baseAmount.multiply(BigDecimal.valueOf(item.getDiscount()))
								.divide(BigDecimal.valueOf(100));
						return baseAmount.add(taxAmount).subtract(discountAmount);
					})
					.reduce(BigDecimal.ZERO, BigDecimal::add);

			infoTable.addCell(new Cell()
					.add(new Paragraph("Total Amount").setBold().setFontSize(9))
					.setBackgroundColor(new com.itextpdf.kernel.colors.DeviceRgb(248, 249, 250))
					.setBorder(new SolidBorder(headerColor, 1))
					.setPadding(5));
			infoTable.addCell(new Cell()
					.add(new Paragraph("₹" + totalAmount.setScale(2, java.math.RoundingMode.HALF_UP)).setFontSize(9)
							.setBold())
					.setBorder(new SolidBorder(headerColor, 1))
					.setPadding(5));

			document.add(infoTable);

			/* ================= ITEMS TABLE ================= */
			document.add(new Paragraph("Invoice Items").setBold().setFontSize(12).setFontColor(headerColor)
					.setMarginBottom(8));

			Table itemsTable = new Table(new float[] { 1, 4, 2, 2, 1.5f, 1.5f, 2 });
			itemsTable.setWidth(UnitValue.createPercentValue(100));

			// Table Headers
			String[] headers = { "#", "Item Name", "Quantity", "Price (₹)", "Tax (%)", "Disc (%)", "Total (₹)" };
			for (String header : headers) {
				itemsTable.addHeaderCell(new Cell()
						.add(new Paragraph(header).setBold().setFontSize(9))
						.setBackgroundColor(headerColor)
						.setFontColor(ColorConstants.WHITE)
						.setBorder(new SolidBorder(headerColor, 2))
						.setTextAlignment(TextAlignment.CENTER)
						.setPadding(6));
			}

			// Table Rows
			int index = 1;
			for (InvoiceItems item : items) {
				BigDecimal baseAmount = BigDecimal.valueOf(item.getQty()).multiply(BigDecimal.valueOf(item.getPrice()));
				BigDecimal taxAmount = baseAmount.multiply(BigDecimal.valueOf(item.getTax()))
						.divide(BigDecimal.valueOf(100));
				BigDecimal discountAmount = baseAmount.multiply(BigDecimal.valueOf(item.getDiscount()))
						.divide(BigDecimal.valueOf(100));
				BigDecimal itemTotal = baseAmount.add(taxAmount).subtract(discountAmount);

				com.itextpdf.kernel.colors.Color rowColor = index % 2 == 0
						? new com.itextpdf.kernel.colors.DeviceRgb(248, 249, 250)
						: ColorConstants.WHITE;

				itemsTable.addCell(new Cell()
						.add(new Paragraph(String.valueOf(index)).setFontSize(9))
						.setBackgroundColor(rowColor)
						.setBorder(new SolidBorder(headerColor, 1))
						.setTextAlignment(TextAlignment.CENTER)
						.setPadding(5));

				itemsTable.addCell(new Cell()
						.add(new Paragraph(item.getItemName()).setFontSize(9))
						.setBackgroundColor(rowColor)
						.setBorder(new SolidBorder(headerColor, 1))
						.setPadding(5));

				itemsTable.addCell(new Cell()
						.add(new Paragraph(String.valueOf(item.getQty())).setFontSize(9))
						.setBackgroundColor(rowColor)
						.setBorder(new SolidBorder(headerColor, 1))
						.setTextAlignment(TextAlignment.CENTER)
						.setPadding(5));

				itemsTable.addCell(new Cell()
						.add(new Paragraph(String.format("%.2f", item.getPrice())).setFontSize(9))
						.setBackgroundColor(rowColor)
						.setBorder(new SolidBorder(headerColor, 1))
						.setTextAlignment(TextAlignment.RIGHT)
						.setPadding(5));

				itemsTable.addCell(new Cell()
						.add(new Paragraph(String.format("%.1f", item.getTax())).setFontSize(9))
						.setBackgroundColor(rowColor)
						.setBorder(new SolidBorder(headerColor, 1))
						.setTextAlignment(TextAlignment.CENTER)
						.setPadding(5));

				itemsTable.addCell(new Cell()
						.add(new Paragraph(String.format("%.1f", item.getDiscount())).setFontSize(9))
						.setBackgroundColor(rowColor)
						.setBorder(new SolidBorder(headerColor, 1))
						.setTextAlignment(TextAlignment.CENTER)
						.setPadding(5));

				itemsTable.addCell(new Cell()
						.add(new Paragraph(String.format("%.2f", itemTotal)).setFontSize(9).setBold())
						.setBackgroundColor(rowColor)
						.setBorder(new SolidBorder(headerColor, 1))
						.setTextAlignment(TextAlignment.RIGHT)
						.setPadding(5));

				index++;
			}

			document.add(itemsTable);

			/* ================= FOOTER WITH SIGNATURE ================= */
			document.add(new LineSeparator(new SolidLine(1)).setMarginTop(20).setMarginBottom(15));

			Table footerTable = new Table(new float[] { 1, 1 });
			footerTable.setWidth(UnitValue.createPercentValue(100));

			// Signature Cell
			Cell signatureCell = new Cell().setBorder(Border.NO_BORDER);
			if (business != null && business.getSignature() != null) {
				try {
					Image signature = new Image(ImageDataFactory.create(business.getSignature()));
					signature.scaleToFit(150, 75);
					signatureCell.add(signature);
				} catch (Exception e) {
					// Signature image failed to load
				}
			}
			signatureCell.add(new Paragraph("Authorized Signature")
					.setBold().setFontSize(10).setFontColor(headerColor).setMarginTop(5));
			signatureCell.add(new Paragraph(business != null ? business.getBusinessName() : "")
					.setFontSize(9).setItalic());
			footerTable.addCell(signatureCell);

			// Notes Cell
			Cell notesCell = new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT);
			notesCell.add(new Paragraph("Notes").setBold().setFontSize(10).setFontColor(headerColor));
			notesCell.add(new Paragraph("Thank you for your business!")
					.setFontSize(9).setItalic().setMarginTop(5));
			footerTable.addCell(notesCell);

			document.add(footerTable);

			// Print timestamp
			document.add(new Paragraph(
					"Printed: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm")))
					.setFontSize(8)
					.setFontColor(ColorConstants.GRAY)
					.setTextAlignment(TextAlignment.CENTER)
					.setMarginTop(15));

			document.close();
			return out.toByteArray();
		} catch (Exception e) {
			e.printStackTrace();
			return new byte[0];
		}
	}

	// Generate Items Inventory Report PDF
	public byte[] generateInventoryReport(List<Product> products, String businessId) {

		try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {

			PdfWriter writer = new PdfWriter(out);
			PdfDocument pdf = new PdfDocument(writer);

			// Fetch business data first
			final Business business = businessRepository.findById(businessId).orElse(null);
			final GstDetails gstDetails = gstDetailsRepository.findByBusiness_Id(businessId).orElse(null);

			final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
			DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");

			// Define professional colors
			final com.itextpdf.kernel.colors.DeviceRgb headerColor = new com.itextpdf.kernel.colors.DeviceRgb(44, 62,
					80); // #2c3e50

			// Add page event handler for header on every page
			pdf.addEventHandler(PdfDocumentEvent.END_PAGE,
					new IEventHandler() {
						@Override
						public void handleEvent(Event event) {
							PdfDocumentEvent docEvent = (PdfDocumentEvent) event;
							PdfDocument pdfDoc = docEvent.getDocument();
							PdfPage page = docEvent.getPage();
							Rectangle pageSize = page.getPageSize();

							PdfCanvas pdfCanvas = new PdfCanvas(
									page.newContentStreamBefore(), page.getResources(), pdfDoc);

							try (Canvas canvas = new Canvas(pdfCanvas, pageSize)) {
								// Create header table
								Table headerTable = new Table(new float[] { 2, 5, 2 });
								headerTable.setWidth(UnitValue.createPercentValue(100));
								headerTable.setFixedPosition(20, pageSize.getTop() - 110, pageSize.getWidth() - 40);

								// Logo Cell
								Cell logoCell = new Cell().setBorder(Border.NO_BORDER);
								if (business != null && business.getBusinessLogo() != null) {
									try {
										Image logo = new Image(ImageDataFactory.create(business.getBusinessLogo()));
										logo.scaleToFit(80, 80);
										logoCell.add(logo);
									} catch (Exception e) {
										logoCell.add(new Paragraph("LOGO").setBold().setFontSize(12));
									}
								} else {
									logoCell.add(new Paragraph("LOGO").setBold().setFontSize(12));
								}
								headerTable.addCell(logoCell);

								// Business Info Cell
								Cell businessInfoCell = new Cell().setBorder(Border.NO_BORDER);
								if (business != null) {
									businessInfoCell.add(new Paragraph(business.getBusinessName())
											.setBold().setFontSize(16).setFontColor(headerColor));
									businessInfoCell.add(
											new Paragraph("Phone: " + nullSafe(business.getPhoneNo())).setFontSize(8));
									businessInfoCell.add(
											new Paragraph("Email: " + nullSafe(business.getEmail())).setFontSize(8));
									businessInfoCell.add(new Paragraph(
											"GSTIN: " + (gstDetails != null ? nullSafe(gstDetails.getGstNo())
													: "Not Registered"))
											.setFontSize(8));
									String address = String.format("%s, %s, %s - %s",
											nullSafe(business.getAddress()),
											nullSafe(business.getCity()),
											nullSafe(business.getState()),
											nullSafe(business.getPincode())).replaceAll(", ,", ",")
											.replaceAll("^, |, $", "");
									businessInfoCell.add(new Paragraph("Address: " + address).setFontSize(8));
								}
								headerTable.addCell(businessInfoCell);

								// Date Cell
								Cell dateCell = new Cell().setBorder(Border.NO_BORDER)
										.setTextAlignment(TextAlignment.RIGHT);
								dateCell.add(
										new Paragraph("Print Date").setBold().setFontSize(9).setFontColor(headerColor));
								dateCell.add(
										new Paragraph(LocalDate.now().format(dateFormatter)).setFontSize(11).setBold());
								headerTable.addCell(dateCell);

								canvas.add(headerTable);

								// Add separator line
								canvas.add(new LineSeparator(new SolidLine(2))
										.setFixedPosition(20, pageSize.getTop() - 115, pageSize.getWidth() - 40));
							}
						}
					});

			Document document = new Document(pdf, PageSize.A4);

			// Adjust top margin to accommodate header
			document.setMargins(130, 20, 20, 20);

			/* ================= DOCUMENT TITLE ================= */
			document.add(new Paragraph("ITEMS INVENTORY REPORT")
					.setBold()
					.setFontSize(16)
					.setTextAlignment(TextAlignment.CENTER)
					.setFontColor(headerColor)
					.setMarginBottom(15));

			/* ================= SUMMARY SECTION ================= */
			// Calculate summary statistics
			int totalItems = products.size();
			int totalStock = products.stream()
					.mapToInt(p -> p.getRemainingStock() != null ? p.getRemainingStock() : 0)
					.sum();
			long lowStockItems = products.stream()
					.filter(p -> {
						int remainingStock = p.getRemainingStock() != null ? p.getRemainingStock() : 0;
						return remainingStock > 0 && remainingStock <= 10; // Low stock threshold
					})
					.count();
			long outOfStockItems = products.stream()
					.filter(p -> {
						int remainingStock = p.getRemainingStock() != null ? p.getRemainingStock() : 0;
						return remainingStock == 0;
					})
					.count();

			Table summaryTable = new Table(new float[] { 3, 3, 3, 3 });
			summaryTable.setWidth(UnitValue.createPercentValue(100));

			// Summary headers with bold borders
			summaryTable.addHeaderCell(new Cell()
					.add(new Paragraph("Total Items").setBold().setFontSize(10))
					.setBackgroundColor(headerColor)
					.setFontColor(ColorConstants.WHITE)
					.setBorder(new SolidBorder(headerColor, 2))
					.setTextAlignment(TextAlignment.CENTER)
					.setPadding(6));
			summaryTable.addHeaderCell(new Cell()
					.add(new Paragraph("Total Stock").setBold().setFontSize(10))
					.setBackgroundColor(headerColor)
					.setFontColor(ColorConstants.WHITE)
					.setBorder(new SolidBorder(headerColor, 2))
					.setTextAlignment(TextAlignment.CENTER)
					.setPadding(6));
			summaryTable.addHeaderCell(new Cell()
					.add(new Paragraph("Low Stock Items").setBold().setFontSize(10))
					.setBackgroundColor(headerColor)
					.setFontColor(ColorConstants.WHITE)
					.setBorder(new SolidBorder(headerColor, 2))
					.setTextAlignment(TextAlignment.CENTER)
					.setPadding(6));
			summaryTable.addHeaderCell(new Cell()
					.add(new Paragraph("Out of Stock").setBold().setFontSize(10))
					.setBackgroundColor(headerColor)
					.setFontColor(ColorConstants.WHITE)
					.setBorder(new SolidBorder(headerColor, 2))
					.setTextAlignment(TextAlignment.CENTER)
					.setPadding(6));

			// Summary data with bold borders
			summaryTable.addCell(new Cell()
					.add(new Paragraph(String.valueOf(totalItems)).setFontSize(9))
					.setBorder(new SolidBorder(headerColor, 2))
					.setTextAlignment(TextAlignment.CENTER)
					.setPadding(5));
			summaryTable.addCell(new Cell()
					.add(new Paragraph(String.valueOf(totalStock)).setFontSize(9))
					.setBorder(new SolidBorder(headerColor, 2))
					.setTextAlignment(TextAlignment.CENTER)
					.setPadding(5));
			summaryTable.addCell(new Cell()
					.add(new Paragraph(String.valueOf(lowStockItems)).setFontSize(9))
					.setBorder(new SolidBorder(headerColor, 2))
					.setTextAlignment(TextAlignment.CENTER)
					.setPadding(5));
			summaryTable.addCell(new Cell()
					.add(new Paragraph(String.valueOf(outOfStockItems)).setFontSize(9))
					.setBorder(new SolidBorder(headerColor, 2))
					.setTextAlignment(TextAlignment.CENTER)
					.setPadding(5));

			document.add(summaryTable);
			document.add(new Paragraph("\n").setFontSize(8));

			/* ================= ITEMS DETAILS TABLE ================= */
			document.add(new Paragraph("Items Details:")
					.setBold()
					.setFontSize(12)
					.setFontColor(headerColor)
					.setMarginTop(5)
					.setMarginBottom(8));

			if (products != null && !products.isEmpty()) {
				Table itemsTable = new Table(new float[] { 1.5f, 3, 2, 1.5f, 1.5f, 1.5f, 2 });
				itemsTable.setWidth(UnitValue.createPercentValue(100));

				// Headers
				String[] headers = { "Product ID", "Product Name", "Category", "Total Stock", "Current Stock",
						"Total Sold", "Status" };
				for (String header : headers) {
					itemsTable.addHeaderCell(new Cell()
							.add(new Paragraph(header).setBold().setFontSize(9))
							.setBackgroundColor(headerColor)
							.setFontColor(ColorConstants.WHITE)
							.setBorder(new SolidBorder(headerColor, 2))
							.setTextAlignment(TextAlignment.CENTER)
							.setPadding(5));
				}

				// Data rows
				for (Product product : products) {
					int remainingStock = product.getRemainingStock() != null ? product.getRemainingStock() : 0;
					int totalStockValue = product.getTotalStock() != null ? product.getTotalStock() : 0;
					int totalSold = totalStockValue - remainingStock;

					String status;
					if (remainingStock == 0) {
						status = "Out of Stock";
					} else if (remainingStock <= 10) {
						status = "Low Stock";
					} else {
						status = "In Stock";
					}

					itemsTable.addCell(new Cell()
							.add(new Paragraph(product.getId() != null ? product.getId().toString() : "-")
									.setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 2))
							.setPadding(4));
					itemsTable.addCell(new Cell()
							.add(new Paragraph(product.getProductName() != null ? product.getProductName() : "-")
									.setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 2))
							.setPadding(4));
					itemsTable.addCell(new Cell()
							.add(new Paragraph(product.getCategory() != null ? product.getCategory() : "-")
									.setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 2))
							.setPadding(4));
					itemsTable.addCell(new Cell()
							.add(new Paragraph(String.valueOf(totalStockValue)).setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 2))
							.setTextAlignment(TextAlignment.CENTER)
							.setPadding(4));
					itemsTable.addCell(new Cell()
							.add(new Paragraph(String.valueOf(remainingStock)).setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 2))
							.setTextAlignment(TextAlignment.CENTER)
							.setPadding(4));
					itemsTable.addCell(new Cell()
							.add(new Paragraph(String.valueOf(totalSold)).setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 2))
							.setTextAlignment(TextAlignment.CENTER)
							.setPadding(4));
					itemsTable.addCell(new Cell()
							.add(new Paragraph(status).setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 2))
							.setTextAlignment(TextAlignment.CENTER)
							.setPadding(4));
				}
				document.add(itemsTable);
			} else {
				document.add(new Paragraph("No items found in inventory")
						.setItalic()
						.setFontSize(10));
			}

			document.add(new Paragraph("\n"));

			/* ================= FOOTER ================= */
			document.add(new LineSeparator(new SolidLine()));
			Paragraph footer = new Paragraph(
					"Generated on: " + LocalDateTime.now().format(dateTimeFormatter))
					.setFontSize(8)
					.setTextAlignment(TextAlignment.CENTER)
					.setItalic();
			document.add(footer);

			document.close();
			return out.toByteArray();
		} catch (Exception e) {
			e.printStackTrace();
			return new byte[0];
		}
	}

	// Helper method to convert amount to words (Indian numbering system)
	private String convertAmountToWords(double amount) {
		try {
			long rupees = (long) amount;
			int paise = (int) Math.round((amount - rupees) * 100);

			String[] ones = { "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine" };
			String[] teens = { "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
					"Eighteen", "Nineteen" };
			String[] tens = { "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety" };

			if (rupees == 0 && paise == 0) {
				return "Zero Rupees Only";
			}

			StringBuilder words = new StringBuilder();

			// Crores
			if (rupees >= 10000000) {
				long crores = rupees / 10000000;
				words.append(convertNumberToWords(crores, ones, teens, tens)).append(" Crore ");
				rupees %= 10000000;
			}

			// Lakhs
			if (rupees >= 100000) {
				long lakhs = rupees / 100000;
				words.append(convertNumberToWords(lakhs, ones, teens, tens)).append(" Lakh ");
				rupees %= 100000;
			}

			// Thousands
			if (rupees >= 1000) {
				long thousands = rupees / 1000;
				words.append(convertNumberToWords(thousands, ones, teens, tens)).append(" Thousand ");
				rupees %= 1000;
			}

			// Hundreds
			if (rupees >= 100) {
				long hundreds = rupees / 100;
				words.append(ones[(int) hundreds]).append(" Hundred ");
				rupees %= 100;
			}

			// Remaining (1-99)
			if (rupees > 0) {
				words.append(convertNumberToWords(rupees, ones, teens, tens));
			}

			String result = words.toString().trim() + " Rupees";

			if (paise > 0) {
				result += " and " + convertNumberToWords(paise, ones, teens, tens) + " Paise";
			}

			return result + " Only";
		} catch (Exception e) {
			return "Amount conversion error";
		}
	}

	private String convertNumberToWords(long number, String[] ones, String[] teens, String[] tens) {
		if (number == 0)
			return "";
		if (number < 10)
			return ones[(int) number];
		if (number < 20)
			return teens[(int) number - 10];
		if (number < 100) {
			int tensDigit = (int) (number / 10);
			int onesDigit = (int) (number % 10);
			return tens[tensDigit] + (onesDigit > 0 ? " " + ones[onesDigit] : "");
		}
		return "";
	}

	// Generate Sales Slip PDF
	public byte[] generateSalesSlip(Invoice invoice, List<InvoiceItems> invoiceItems, String businessId) {
		try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			PdfWriter writer = new PdfWriter(out);
			PdfDocument pdf = new PdfDocument(writer);
			Document document = new Document(pdf, PageSize.A4);
			document.setMargins(30, 30, 30, 30);

			// Fetch business data
			Business business = businessRepository.findById(businessId).orElse(null);
			GstDetails gstDetails = gstDetailsRepository.findByBusiness_Id(businessId).orElse(null);

			DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
			DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");

			// Define professional colors
			com.itextpdf.kernel.colors.DeviceRgb headerColor = new com.itextpdf.kernel.colors.DeviceRgb(44, 62, 80); // #2c3e50

			/* ================= HEADER SECTION ================= */
			// Slip Title
			document.add(new Paragraph("SALES SLIP")
					.setBold()
					.setFontSize(20)
					.setTextAlignment(TextAlignment.CENTER)
					.setFontColor(headerColor)
					.setMarginBottom(5));

			// Slip Number and Date
			Table slipInfoTable = new Table(new float[] { 1, 1 });
			slipInfoTable.setWidth(UnitValue.createPercentValue(100));
			slipInfoTable.addCell(new Cell()
					.add(new Paragraph("Slip No: " + (invoice.getInvoiceId() != null ? invoice.getInvoiceId() : "-"))
							.setFontSize(10).setBold())
					.setBorder(Border.NO_BORDER)
					.setTextAlignment(TextAlignment.LEFT));
			slipInfoTable.addCell(new Cell()
					.add(new Paragraph("Date: " + LocalDate.now().format(dateFormatter))
							.setFontSize(10).setBold())
					.setBorder(Border.NO_BORDER)
					.setTextAlignment(TextAlignment.RIGHT));
			document.add(slipInfoTable);
			document.add(new LineSeparator(new SolidLine(2)).setMarginTop(5).setMarginBottom(10));

			/* ================= BUSINESS DETAILS ================= */
			document.add(new Paragraph("Business Details")
					.setBold()
					.setFontSize(12)
					.setFontColor(headerColor)
					.setMarginBottom(5));

			Table businessTable = new Table(new float[] { 1 });
			businessTable.setWidth(UnitValue.createPercentValue(100));

			if (business != null) {
				businessTable.addCell(new Cell()
						.add(new Paragraph(business.getBusinessName())
								.setBold().setFontSize(14).setFontColor(headerColor))
						.setBorder(Border.NO_BORDER)
						.setPadding(2));
				businessTable.addCell(new Cell()
						.add(new Paragraph("Contact: " + nullSafe(business.getPhoneNo())).setFontSize(9))
						.setBorder(Border.NO_BORDER)
						.setPadding(2));
				businessTable.addCell(new Cell()
						.add(new Paragraph("Email: " + nullSafe(business.getEmail())).setFontSize(9))
						.setBorder(Border.NO_BORDER)
						.setPadding(2));
				businessTable.addCell(new Cell()
						.add(new Paragraph(
								"GSTIN: " + (gstDetails != null ? nullSafe(gstDetails.getGstNo()) : "Not Registered"))
								.setFontSize(9))
						.setBorder(Border.NO_BORDER)
						.setPadding(2));

				String address = String.format("%s, %s, %s - %s",
						nullSafe(business.getAddress()),
						nullSafe(business.getCity()),
						nullSafe(business.getState()),
						nullSafe(business.getPincode())).replaceAll(", ,", ",").replaceAll("^, |, $", "");
				businessTable.addCell(new Cell()
						.add(new Paragraph("Address: " + address).setFontSize(9))
						.setBorder(Border.NO_BORDER)
						.setPadding(2));
			}
			document.add(businessTable);
			document.add(new LineSeparator(new SolidLine(1)).setMarginTop(8).setMarginBottom(8));

			/* ================= SALE INFORMATION ================= */
			document.add(new Paragraph("Sale Information")
					.setBold()
					.setFontSize(12)
					.setFontColor(headerColor)
					.setMarginBottom(5));

			Table saleInfoTable = new Table(new float[] { 1, 1 });
			saleInfoTable.setWidth(UnitValue.createPercentValue(100));
			saleInfoTable.addCell(new Cell()
					.add(new Paragraph(
							"Sale Invoice ID: " + (invoice.getInvoiceId() != null ? invoice.getInvoiceId() : "-"))
							.setFontSize(10).setBold())
					.setBorder(Border.NO_BORDER)
					.setPadding(3));
			saleInfoTable.addCell(new Cell()
					.add(new Paragraph("Customer Name: " +
							(invoice.getCustomer() != null && invoice.getCustomer().getName() != null
									? invoice.getCustomer().getName()
									: "-"))
							.setFontSize(10).setBold())
					.setBorder(Border.NO_BORDER)
					.setPadding(3));
			document.add(saleInfoTable);
			document.add(new LineSeparator(new SolidLine(1)).setMarginTop(8).setMarginBottom(10));

			/* ================= ITEMS TABLE ================= */
			document.add(new Paragraph("Sale Items")
					.setBold()
					.setFontSize(12)
					.setFontColor(headerColor)
					.setMarginBottom(8));

			if (invoiceItems != null && !invoiceItems.isEmpty()) {
				Table itemsTable = new Table(new float[] { 0.8f, 4, 1.5f, 2f, 2.5f });
				itemsTable.setWidth(UnitValue.createPercentValue(100));

				// Headers
				String[] headers = { "Sr", "Product Name", "Qty", "Unit Price", "Total" };
				for (String header : headers) {
					itemsTable.addHeaderCell(new Cell()
							.add(new Paragraph(header).setBold().setFontSize(9))
							.setBackgroundColor(headerColor)
							.setFontColor(ColorConstants.WHITE)
							.setBorder(new SolidBorder(headerColor, 2))
							.setTextAlignment(TextAlignment.CENTER)
							.setPadding(5));
				}

				// Calculate totals
				double grandTotal = 0;

				// Data rows
				int index = 1;
				for (InvoiceItems item : invoiceItems) {
					int quantity = item.getQty();
					double unitPrice = item.getPrice();

					double itemTotal = quantity * unitPrice;
					grandTotal += itemTotal;

					itemsTable.addCell(new Cell()
							.add(new Paragraph(String.valueOf(index++)).setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 1))
							.setTextAlignment(TextAlignment.CENTER)
							.setPadding(4));
					itemsTable.addCell(new Cell()
							.add(new Paragraph(item.getItemName() != null ? item.getItemName() : "-")
									.setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 1))
							.setPadding(4));
					itemsTable.addCell(new Cell()
							.add(new Paragraph(String.valueOf(quantity)).setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 1))
							.setTextAlignment(TextAlignment.CENTER)
							.setPadding(4));
					itemsTable.addCell(new Cell()
							.add(new Paragraph("?" + String.format("%.2f", unitPrice)).setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 1))
							.setTextAlignment(TextAlignment.RIGHT)
							.setPadding(4));
					itemsTable.addCell(new Cell()
							.add(new Paragraph("?" + String.format("%.2f", itemTotal)).setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 1))
							.setTextAlignment(TextAlignment.RIGHT)
							.setPadding(4));
				}

				document.add(itemsTable);

				/* ================= TOTALS SECTION ================= */
				document.add(new Paragraph("\n").setFontSize(6));

				Table totalsTable = new Table(new float[] { 3, 2 });
				totalsTable.setWidth(UnitValue.createPercentValue(50));
				totalsTable.setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.RIGHT);

				// Grand Total
				totalsTable.addCell(new Cell()
						.add(new Paragraph("Grand Total:").setBold().setFontSize(12).setFontColor(headerColor))
						.setBorder(new SolidBorder(headerColor, 2))
						.setBackgroundColor(new com.itextpdf.kernel.colors.DeviceRgb(240, 240, 240))
						.setTextAlignment(TextAlignment.RIGHT)
						.setPadding(5));
				totalsTable.addCell(new Cell()
						.add(new Paragraph("?" + String.format("%.2f", grandTotal)).setBold().setFontSize(12)
								.setFontColor(headerColor))
						.setBorder(new SolidBorder(headerColor, 2))
						.setBackgroundColor(new com.itextpdf.kernel.colors.DeviceRgb(240, 240, 240))
						.setTextAlignment(TextAlignment.RIGHT)
						.setPadding(5));

				document.add(totalsTable);

				/* ================= AMOUNT IN WORDS ================= */
				document.add(new Paragraph("\n").setFontSize(6));
				String amountInWords = convertAmountToWords(grandTotal);
				document.add(new Paragraph("Amount in Words: " + amountInWords)
						.setBold()
						.setFontSize(10)
						.setItalic()
						.setFontColor(headerColor)
						.setMarginTop(10)
						.setMarginBottom(15));

			} else {
				document.add(new Paragraph("No items found for this sale")
						.setItalic()
						.setFontSize(10)
						.setFontColor(ColorConstants.GRAY));
			}

			/* ================= FOOTER ================= */
			document.add(new LineSeparator(new SolidLine(1)).setMarginTop(15));
			document.add(new Paragraph("Generated on: " + LocalDateTime.now().format(dateTimeFormatter))
					.setFontSize(8)
					.setTextAlignment(TextAlignment.CENTER)
					.setItalic()
					.setMarginTop(10));

			document.add(new Paragraph("Thank you for your business!")
					.setFontSize(9)
					.setTextAlignment(TextAlignment.CENTER)
					.setBold()
					.setMarginTop(5));

			document.close();
			return out.toByteArray();
		} catch (Exception e) {
			e.printStackTrace();
			return new byte[0];
		}
	}

	// Generate Sales Slip PDF from Sale (not Invoice)
	public byte[] generateSalesSlipFromSale(Sale sale, List<SaleItem> saleItems, Customer customer, String businessId) {
		try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			PdfWriter writer = new PdfWriter(out);
			PdfDocument pdf = new PdfDocument(writer);
			Document document = new Document(pdf, PageSize.A4);
			document.setMargins(30, 30, 30, 30);

			Optional<UserBusiness> userBusinessOpt = userBusinessRepository.findById(customer.getBusinessId());
			if (userBusinessOpt.isEmpty()) {
				System.out.println("UserBusiness NOT FOUND");
				return new byte[0];
			}

			UserBusiness userBusiness = userBusinessOpt.get();
			Business business = userBusiness.getBusiness();
			if (business == null) {
				System.out.println("Business NOT FOUND");
				return new byte[0];
			}

			GstDetails gstDetails = gstDetailsRepository.findByBusinessId(business.getId()).orElse(null);

			DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
			DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");

			// Define professional colors
			com.itextpdf.kernel.colors.DeviceRgb headerColor = new com.itextpdf.kernel.colors.DeviceRgb(44, 62, 80); // #2c3e50

			/* ================= BUSINESS HEADER WITH LOGO ================= */
			Table headerTable = new Table(new float[] { 2, 5, 2 });
			headerTable.setWidth(UnitValue.createPercentValue(100));

			// Logo Cell
			Cell logoCell = new Cell().setBorder(Border.NO_BORDER);
			if (business != null && business.getBusinessLogo() != null) {
				try {
					Image logo = new Image(ImageDataFactory.create(business.getBusinessLogo()));
					logo.scaleToFit(100, 100);
					logoCell.add(logo);
				} catch (Exception e) {
					logoCell.add(new Paragraph("LOGO").setBold().setFontSize(14));
				}
			} else {
				logoCell.add(new Paragraph("LOGO").setBold().setFontSize(14));
			}
			headerTable.addCell(logoCell);

			// Business Info Cell
			Cell businessInfoCell = new Cell().setBorder(Border.NO_BORDER);
			if (business != null) {
				businessInfoCell.add(new Paragraph(business.getBusinessName())
						.setBold().setFontSize(20).setFontColor(headerColor));
				businessInfoCell.add(new Paragraph("Phone: " + nullSafe(business.getPhoneNo())).setFontSize(9));
				businessInfoCell.add(new Paragraph("Email: " + nullSafe(business.getEmail())).setFontSize(9));
				businessInfoCell.add(new Paragraph(
						"GSTIN: " + (gstDetails != null ? nullSafe(gstDetails.getGstNo()) : "Not Registered"))
						.setFontSize(9));
				String fullAddress = String.format("%s, %s, %s - %s",
						nullSafe(business.getAddress()),
						nullSafe(business.getCity()),
						nullSafe(business.getState()),
						nullSafe(business.getPincode())).replaceAll(", ,", ",").replaceAll("^, |, $", "");
				businessInfoCell.add(new Paragraph("Address: " + fullAddress).setFontSize(9));
			}
			headerTable.addCell(businessInfoCell);

			// Slip Info Cell
			Cell slipInfoCell = new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT);
			slipInfoCell.add(new Paragraph("Slip No").setBold().setFontSize(10).setFontColor(headerColor));
			slipInfoCell
					.add(new Paragraph(sale.getId() != null ? sale.getId().toString() : "-").setFontSize(12).setBold());
			slipInfoCell.add(new Paragraph("Date").setBold().setFontSize(10).setFontColor(headerColor).setMarginTop(5));
			slipInfoCell.add(new Paragraph(sale.getCreatedAt() != null
					? sale.getCreatedAt().format(dateFormatter)
					: "-").setFontSize(12).setBold());
			headerTable.addCell(slipInfoCell);

			document.add(headerTable);
			document.add(new LineSeparator(new SolidLine(3)).setMarginTop(10).setMarginBottom(10));

			/* ================= SALE INFO ================= */
			Table saleInfoTable = new Table(2);
			saleInfoTable.setWidth(UnitValue.createPercentValue(100));
			saleInfoTable.addCell(new Cell()
					.add(new Paragraph("Sale ID: " + (sale.getId() != null ? sale.getId().toString() : "-"))
							.setFontSize(10).setBold())
					.setBorder(Border.NO_BORDER)
					.setPadding(3));
			saleInfoTable.addCell(new Cell()
					.add(new Paragraph("Customer Name: " + (customer != null && customer.getName() != null
							? customer.getName()
							: "-"))
							.setFontSize(10).setBold())
					.setBorder(Border.NO_BORDER)
					.setPadding(3));
			document.add(saleInfoTable);
			document.add(new LineSeparator(new SolidLine(1)).setMarginTop(8).setMarginBottom(10));

			/* ================= ITEMS TABLE ================= */
			document.add(new Paragraph("Sale Items")
					.setBold()
					.setFontSize(12)
					.setFontColor(headerColor)
					.setMarginBottom(8));

			if (saleItems != null && !saleItems.isEmpty()) {
				Table itemsTable = new Table(new float[] { 0.8f, 4, 1.5f, 2f, 2.5f });
				itemsTable.setWidth(UnitValue.createPercentValue(100));

				// Headers
				String[] headers = { "Sr", "Product Name", "Qty", "Unit Price", "Total" };
				for (String header : headers) {
					itemsTable.addHeaderCell(new Cell()
							.add(new Paragraph(header).setBold().setFontSize(9))
							.setBackgroundColor(headerColor)
							.setFontColor(ColorConstants.WHITE)
							.setBorder(new SolidBorder(headerColor, 2))
							.setTextAlignment(TextAlignment.CENTER)
							.setPadding(5));
				}

				// Calculate totals
				double subtotal = 0;
				double totalTaxAmount = 0;
				double totalDiscountAmount = 0;

				// Data rows
				int index = 1;
				for (SaleItem item : saleItems) {
					int quantity = item.getQuantity() != null ? item.getQuantity() : 0;
					double unitPrice = item.getPrice() != null ? item.getPrice() : 0;

					// Fetch InvoiceItem to get tax and discount percentages
					InvoiceItems invoiceItem = invoiceItemsRepository
							.findByIdAndIsDeletedFalse(item.getSaleItemId())
							.orElse(null);

					double taxPercent = invoiceItem != null ? invoiceItem.getTax() : 0.0;
					double discountPercent = invoiceItem != null ? invoiceItem.getDiscount() : 0.0;

					// Calculate item subtotal
					double itemSubtotal = quantity * unitPrice;
					subtotal += itemSubtotal;

					// Calculate tax and discount amounts from percentages
					double itemTaxAmount = (itemSubtotal * taxPercent) / 100.0;
					double itemDiscountAmount = (itemSubtotal * discountPercent) / 100.0;

					totalTaxAmount += itemTaxAmount;
					totalDiscountAmount += itemDiscountAmount;

					itemsTable.addCell(new Cell()
							.add(new Paragraph(String.valueOf(index++)).setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 1))
							.setTextAlignment(TextAlignment.CENTER)
							.setPadding(4));
					itemsTable.addCell(new Cell()
							.add(new Paragraph(item.getProduct() != null && item.getProduct().getProductName() != null
									? item.getProduct().getProductName()
									: "-")
									.setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 1))
							.setPadding(4));
					itemsTable.addCell(new Cell()
							.add(new Paragraph(String.valueOf(quantity)).setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 1))
							.setTextAlignment(TextAlignment.CENTER)
							.setPadding(4));
					itemsTable.addCell(new Cell()
							.add(new Paragraph("?" + String.format("%.2f", unitPrice)).setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 1))
							.setTextAlignment(TextAlignment.RIGHT)
							.setPadding(4));
					itemsTable.addCell(new Cell()
							.add(new Paragraph("?" + String.format("%.2f", itemSubtotal)).setFontSize(8))
							.setBorder(new SolidBorder(headerColor, 1))
							.setTextAlignment(TextAlignment.RIGHT)
							.setPadding(4));
				}

				document.add(itemsTable);

				/* ================= TOTALS SECTION ================= */
				document.add(new Paragraph("\n").setFontSize(6));

				double grandTotal = subtotal + totalTaxAmount - totalDiscountAmount;

				Table totalsTable = new Table(new float[] { 3, 2 });
				totalsTable.setWidth(UnitValue.createPercentValue(50));
				totalsTable.setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.RIGHT);

				// Subtotal
				totalsTable.addCell(new Cell()
						.add(new Paragraph("Subtotal:").setFontSize(10))
						.setBorder(Border.NO_BORDER)
						.setTextAlignment(TextAlignment.RIGHT)
						.setPadding(3));
				totalsTable.addCell(new Cell()
						.add(new Paragraph("?" + String.format("%.2f", subtotal)).setFontSize(10))
						.setBorder(Border.NO_BORDER)
						.setTextAlignment(TextAlignment.RIGHT)
						.setPadding(3));

				// Tax
				totalsTable.addCell(new Cell()
						.add(new Paragraph("Tax:").setFontSize(10))
						.setBorder(Border.NO_BORDER)
						.setTextAlignment(TextAlignment.RIGHT)
						.setPadding(3));
				totalsTable.addCell(new Cell()
						.add(new Paragraph("?" + String.format("%.2f", totalTaxAmount)).setFontSize(10))
						.setBorder(Border.NO_BORDER)
						.setTextAlignment(TextAlignment.RIGHT)
						.setPadding(3));

				// Discount
				totalsTable.addCell(new Cell()
						.add(new Paragraph("Discount:").setFontSize(10))
						.setBorder(Border.NO_BORDER)
						.setTextAlignment(TextAlignment.RIGHT)
						.setPadding(3));
				totalsTable.addCell(new Cell()
						.add(new Paragraph("- ?" + String.format("%.2f", totalDiscountAmount)).setFontSize(10))
						.setBorder(Border.NO_BORDER)
						.setTextAlignment(TextAlignment.RIGHT)
						.setPadding(3));

				// Add separator line
				totalsTable.addCell(new Cell(1, 2)
						.add(new Paragraph("").setFontSize(1))
						.setBorder(Border.NO_BORDER)
						.setBorderTop(new SolidBorder(headerColor, 1))
						.setPadding(2));

				// Grand Total
				totalsTable.addCell(new Cell()
						.add(new Paragraph("Grand Total:").setBold().setFontSize(12).setFontColor(headerColor))
						.setBorder(new SolidBorder(headerColor, 2))
						.setBackgroundColor(new com.itextpdf.kernel.colors.DeviceRgb(240, 240, 240))
						.setTextAlignment(TextAlignment.RIGHT)
						.setPadding(8));
				totalsTable.addCell(new Cell()
						.add(new Paragraph("?" + String.format("%.2f", grandTotal)).setBold().setFontSize(12)
								.setFontColor(headerColor))
						.setBorder(new SolidBorder(headerColor, 2))
						.setBackgroundColor(new com.itextpdf.kernel.colors.DeviceRgb(240, 240, 240))
						.setTextAlignment(TextAlignment.RIGHT)
						.setPadding(8));

				document.add(totalsTable);

				/* ================= AMOUNT IN WORDS ================= */
				document.add(new Paragraph("\n").setFontSize(4));
				document.add(new Paragraph("Amount in Words: " + convertAmountToWords(grandTotal))
						.setBold()
						.setFontSize(10)
						.setItalic()
						.setMarginTop(10));
			}

			/* ================= FOOTER ================= */
			document.add(new LineSeparator(new SolidLine(1)).setMarginTop(15));
			document.add(new Paragraph("Generated on: " + LocalDateTime.now().format(dateTimeFormatter))
					.setFontSize(8)
					.setTextAlignment(TextAlignment.CENTER)
					.setItalic()
					.setMarginTop(10));

			document.add(new Paragraph("Thank you for your business!")
					.setFontSize(9)
					.setTextAlignment(TextAlignment.CENTER)
					.setBold()
					.setMarginTop(5));

			document.close();
			return out.toByteArray();
		} catch (Exception e) {
			e.printStackTrace();
			return new byte[0];
		}
	}

	// Generate Purchase Slip PDF with Tax Breakdown by Rate
	public byte[] generatePurchaseSlip(Invoice invoice, List<InvoiceItems> invoiceItems, String businessId) {
		try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			PdfWriter writer = new PdfWriter(out);
			PdfDocument pdf = new PdfDocument(writer);
			// Use smaller page size for compact slip
			Document document = new Document(pdf, PageSize.A5);
			document.setMargins(20, 20, 20, 20);

			Customer customer = invoice.getCustomer();
			if (customer == null) {
				System.out.println("Customer not linked with invoice");
				return new byte[0];
			}

			Optional<UserBusiness> userBusinessOpt = userBusinessRepository.findById(customer.getBusinessId());

			if (userBusinessOpt.isEmpty()) {
				System.out.println("UserBusiness NOT FOUND");
				return new byte[0];
			}

			UserBusiness userBusiness = userBusinessOpt.get();
			Business business = userBusiness.getBusiness();
			if (business == null) {
				System.out.println("Business NOT FOUND");
				return new byte[0];
			}

			System.out.println("Business fetched: " + business.getBusinessName());

			if (business != null) {
				System.out.println("Business Name: " + business.getBusinessName());
				System.out.println("Business Address: " + business.getAddress());
				System.out.println("Business Phone: " + business.getPhoneNo());
			}

			GstDetails gstDetails = gstDetailsRepository.findByBusinessId(business.getId())
					.orElse(null);
			if (gstDetails != null) {
				System.out.println("GSTIN: " + gstDetails.getGstNo());
			}

			DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd-MMM-yyyy");

			/* ================= BUSINESS HEADER ================= */
			System.out.println("Business object: " + (business != null ? "Found" : "NULL"));
			System.out.println("Business Name: " + business.getBusinessName());
			document.add(new Paragraph(business.getBusinessName())
					.setBold()
					.setFontSize(14)
					.setTextAlignment(TextAlignment.CENTER)
					.setMarginBottom(2));

			String fullAddress = String.format("%s, %s, %s - %s",
					nullSafe(business.getAddress()),
					nullSafe(business.getCity()),
					nullSafe(business.getState()),
					nullSafe(business.getPincode())).replaceAll(", ,", ",").replaceAll("^, |, $", "");
			document.add(new Paragraph(fullAddress)
					.setFontSize(8)
					.setTextAlignment(TextAlignment.CENTER)
					.setMarginBottom(1));

			document.add(new Paragraph("Phone: " + nullSafe(business.getPhoneNo()))
					.setFontSize(8)
					.setTextAlignment(TextAlignment.CENTER)
					.setMarginBottom(1));

			document.add(new Paragraph("GSTIN: " + (gstDetails != null ? nullSafe(gstDetails.getGstNo()) : "N/A"))
					.setFontSize(8)
					.setTextAlignment(TextAlignment.CENTER)
					.setMarginBottom(5));

			document.add(new LineSeparator(new SolidLine(1)).setMarginBottom(5));

			/* ================= INVOICE INFO ================= */
			// Get last 6 characters of invoice ID
			String billNo = invoice.getInvoiceId() != null && invoice.getInvoiceId().length() >= 6
					? invoice.getInvoiceId().substring(invoice.getInvoiceId().length() - 6)
					: invoice.getInvoiceId();

			// Get customer info
			String customerName = invoice.getCustomer() != null ? invoice.getCustomer().getName() : "-";
			String customerPhone = invoice.getCustomer() != null ? invoice.getCustomer().getPhone() : "-";
			String invoiceDate = invoice.getInvoiceDate() != null ? invoice.getInvoiceDate()
					: "-";

			Table infoTable = new Table(new float[] { 1, 1 });
			infoTable.setWidth(UnitValue.createPercentValue(100));

			infoTable.addCell(new Cell()
					.add(new Paragraph("Bill No: " + billNo).setFontSize(8).setBold())
					.setBorder(Border.NO_BORDER)
					.setPadding(1));
			infoTable.addCell(new Cell()
					.add(new Paragraph("Date: " + invoiceDate).setFontSize(8).setBold())
					.setBorder(Border.NO_BORDER)
					.setTextAlignment(TextAlignment.RIGHT)
					.setPadding(1));
			infoTable.addCell(new Cell()
					.add(new Paragraph("Customer: " + customerName).setFontSize(8))
					.setBorder(Border.NO_BORDER)
					.setPadding(1));
			infoTable.addCell(new Cell()
					.add(new Paragraph("Phone: " + customerPhone).setFontSize(8))
					.setBorder(Border.NO_BORDER)
					.setTextAlignment(TextAlignment.RIGHT)
					.setPadding(1));

			document.add(infoTable);
			document.add(new LineSeparator(new SolidLine(1)).setMarginTop(5).setMarginBottom(5));

			/* ================= ITEMS TABLE ================= */
			if (invoiceItems != null && !invoiceItems.isEmpty()) {
				Table itemsTable = new Table(new float[] { 0.5f, 2.5f, 0.7f, 1f, 0.7f, 0.7f, 1.2f });
				itemsTable.setWidth(UnitValue.createPercentValue(100));

				// Headers
				String[] headers = { "SN", "Item", "Qty", "Price", "Tax%", "Disc%", "Total" };
				for (String header : headers) {
					itemsTable.addHeaderCell(new Cell()
							.add(new Paragraph(header).setBold().setFontSize(7))
							.setBackgroundColor(ColorConstants.LIGHT_GRAY)
							.setBorder(new SolidBorder(ColorConstants.BLACK, 0.5f))
							.setTextAlignment(TextAlignment.CENTER)
							.setPadding(2));
				}

				// Calculate totals
				double subtotal = 0;
				double totalTaxAmount = 0;
				double totalDiscountAmount = 0;

				// Data rows
				int index = 1;
				for (InvoiceItems item : invoiceItems) {
					int quantity = item.getQty();
					double unitPrice = item.getPrice();
					double taxPercent = item.getTax();
					double discountPercent = item.getDiscount();

					// Calculate amounts
					double baseAmount = quantity * unitPrice;
					double taxAmount = (baseAmount * taxPercent) / 100.0;
					double discountAmount = (baseAmount * discountPercent) / 100.0;

					subtotal += baseAmount;
					totalTaxAmount += taxAmount;
					totalDiscountAmount += discountAmount;

					itemsTable.addCell(new Cell()
							.add(new Paragraph(String.valueOf(index++)).setFontSize(7))
							.setBorder(new SolidBorder(ColorConstants.BLACK, 0.5f))
							.setTextAlignment(TextAlignment.CENTER)
							.setPadding(2));
					itemsTable.addCell(new Cell()
							.add(new Paragraph(item.getItemName() != null ? item.getItemName() : "-")
									.setFontSize(7))
							.setBorder(new SolidBorder(ColorConstants.BLACK, 0.5f))
							.setPadding(2));
					itemsTable.addCell(new Cell()
							.add(new Paragraph(String.valueOf(quantity)).setFontSize(7))
							.setBorder(new SolidBorder(ColorConstants.BLACK, 0.5f))
							.setTextAlignment(TextAlignment.CENTER)
							.setPadding(2));
					itemsTable.addCell(new Cell()
							.add(new Paragraph(String.format("%.2f", unitPrice)).setFontSize(7))
							.setBorder(new SolidBorder(ColorConstants.BLACK, 0.5f))
							.setTextAlignment(TextAlignment.RIGHT)
							.setPadding(2));
					itemsTable.addCell(new Cell()
							.add(new Paragraph(String.format("%.0f", taxPercent)).setFontSize(7))
							.setBorder(new SolidBorder(ColorConstants.BLACK, 0.5f))
							.setTextAlignment(TextAlignment.CENTER)
							.setPadding(2));
					itemsTable.addCell(new Cell()
							.add(new Paragraph(String.format("%.0f", discountPercent)).setFontSize(7))
							.setBorder(new SolidBorder(ColorConstants.BLACK, 0.5f))
							.setTextAlignment(TextAlignment.CENTER)
							.setPadding(2));
					// Total Price column (quantity × unit price)
					itemsTable.addCell(new Cell()
							.add(new Paragraph(String.format("%.2f", baseAmount)).setFontSize(7))
							.setBorder(new SolidBorder(ColorConstants.BLACK, 0.5f))
							.setTextAlignment(TextAlignment.RIGHT)
							.setPadding(2));
				}

				document.add(itemsTable);

				/* ================= TOTALS SECTION ================= */
				document.add(new LineSeparator(new SolidLine(1)).setMarginTop(5).setMarginBottom(3));

				Table totalsTable = new Table(new float[] { 2, 1 });
				totalsTable.setWidth(UnitValue.createPercentValue(100));

				// Subtotal
				totalsTable.addCell(new Cell()
						.add(new Paragraph("Subtotal:").setFontSize(8))
						.setBorder(Border.NO_BORDER)
						.setTextAlignment(TextAlignment.RIGHT)
						.setPadding(1));
				totalsTable.addCell(new Cell()
						.add(new Paragraph("Rs. " + String.format("%.2f", subtotal)).setFontSize(8))
						.setBorder(Border.NO_BORDER)
						.setTextAlignment(TextAlignment.RIGHT)
						.setPadding(1));

				// Tax in Rupees
				totalsTable.addCell(new Cell()
						.add(new Paragraph("Tax:").setFontSize(8))
						.setBorder(Border.NO_BORDER)
						.setTextAlignment(TextAlignment.RIGHT)
						.setPadding(1));
				totalsTable.addCell(new Cell()
						.add(new Paragraph("Rs. " + String.format("%.2f", totalTaxAmount)).setFontSize(8))
						.setBorder(Border.NO_BORDER)
						.setTextAlignment(TextAlignment.RIGHT)
						.setPadding(1));

				// Discount in Rupees
				totalsTable.addCell(new Cell()
						.add(new Paragraph("Discount:").setFontSize(8))
						.setBorder(Border.NO_BORDER)
						.setTextAlignment(TextAlignment.RIGHT)
						.setPadding(1));
				totalsTable.addCell(new Cell()
						.add(new Paragraph("- Rs. " + String.format("%.2f", totalDiscountAmount)).setFontSize(8))
						.setBorder(Border.NO_BORDER)
						.setTextAlignment(TextAlignment.RIGHT)
						.setPadding(1));

				// Separator
				totalsTable.addCell(new Cell(1, 2)
						.add(new Paragraph("").setFontSize(1))
						.setBorder(Border.NO_BORDER)
						.setBorderTop(new SolidBorder(ColorConstants.BLACK, 0.5f))
						.setPadding(1));

				// Grand Total
				double grandTotal = subtotal + totalTaxAmount - totalDiscountAmount;
				totalsTable.addCell(new Cell()
						.add(new Paragraph("TOTAL:").setBold().setFontSize(9))
						.setBorder(Border.NO_BORDER)
						.setTextAlignment(TextAlignment.RIGHT)
						.setPadding(2));
				totalsTable.addCell(new Cell()
						.add(new Paragraph("Rs. " + String.format("%.2f", grandTotal)).setBold().setFontSize(9))
						.setBorder(Border.NO_BORDER)
						.setTextAlignment(TextAlignment.RIGHT)
						.setPadding(2));

				document.add(totalsTable);

				/* ================= AMOUNT IN WORDS ================= */
				String amountInWords = convertAmountToWords(grandTotal);
				document.add(new Paragraph("Amount in Words: " + amountInWords)
						.setFontSize(7)
						.setItalic()
						.setMarginTop(5)
						.setMarginBottom(5));

			} else {
				document.add(new Paragraph("No items found")
						.setItalic()
						.setFontSize(8)
						.setFontColor(ColorConstants.GRAY));
			}

			/* ================= FOOTER ================= */
			document.add(new LineSeparator(new SolidLine(1)).setMarginTop(5));
			document.add(new Paragraph("Thank You")
					.setFontSize(9)
					.setTextAlignment(TextAlignment.CENTER)
					.setBold()
					.setMarginTop(3));

			document.close();
			return out.toByteArray();
		} catch (

		Exception e) {
			e.printStackTrace();
			return new byte[0];
		}
	}
}
