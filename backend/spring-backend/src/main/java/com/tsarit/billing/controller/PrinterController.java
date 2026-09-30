package com.tsarit.billing.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/printers")
@CrossOrigin(originPatterns = "*")
public class PrinterController {

    @PostMapping("/network-print")
    public ResponseEntity<Map<String, Object>> printNetworkReceipt(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        String ip = (String) payload.get("printerIp");
        if (ip == null || ip.trim().isEmpty()) {
            response.put("status", "ERROR");
            response.put("message", "Printer IP address is required");
            return ResponseEntity.badRequest().body(response);
        }

        int port = 9100;
        if (payload.containsKey("port") && payload.get("port") != null) {
            try {
                port = Integer.parseInt(payload.get("port").toString());
            } catch (Exception ignored) {}
        }

        String content = (String) payload.get("content");
        if (content == null || content.isEmpty()) {
            response.put("status", "ERROR");
            response.put("message", "Print content is required");
            return ResponseEntity.badRequest().body(response);
        }

        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(ip, port), 4000);
            socket.setSoTimeout(5000);
            OutputStream out = socket.getOutputStream();

            // ESC @ (Initialize printer)
            out.write(new byte[]{0x1B, 0x40});

            // ESC t 0 (Character code table: PC437 / Standard)
            out.write(new byte[]{0x1B, 0x74, 0x00});

            // Write content
            out.write(content.getBytes(StandardCharsets.UTF_8));

            // Line feeds
            out.write(new byte[]{0x0A, 0x0A, 0x0A, 0x0A});

            // GS V 66 0 (Cut paper)
            out.write(new byte[]{0x1D, 0x56, 0x42, 0x00});

            out.flush();
            response.put("status", "SUCCESS");
            response.put("message", "Print job successfully sent to network printer at " + ip + ":" + port);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "ERROR");
            response.put("message", "Failed to connect to printer at " + ip + ":" + port + ": " + e.getMessage());
            return ResponseEntity.status(502).body(response);
        }
    }

    @GetMapping("/test-connection")
    public ResponseEntity<Map<String, Object>> testConnection(@RequestParam String ip, @RequestParam(defaultValue = "9100") int port) {
        Map<String, Object> response = new HashMap<>();
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(ip, port), 3000);
            response.put("status", "ONLINE");
            response.put("message", "Printer reachable at " + ip + ":" + port);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "OFFLINE");
            response.put("message", "Unable to connect to printer at " + ip + ":" + port + ": " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
}
