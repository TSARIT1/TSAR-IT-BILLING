package com.tsarit.billing.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class BackupController {

    @GetMapping("/backups/")
    public List<Map<String,Object>> list(){
        // This is a simple stub. In production implement actual DB backup listing.
        return List.of(Map.of("id",1,"name","demo-backup.sql","created_at","2025-01-01"));
    }

    @PostMapping("/backups/custom_create_backup/")
    public Map<String,String> create(){
        return Map.of("status","ok","message","backup created (stub)");
    }

    @DeleteMapping("/backups/{backupId}/")
    public Map<String,String> delete(@PathVariable Long backupId){
        return Map.of("status","ok");
    }

    @PostMapping("/backups/{backupId}/restore/")
    public Map<String,String> restore(@PathVariable Long backupId){
        return Map.of("status","ok","message","restore requested (stub)");
    }

    @GetMapping("/backups/{backupId}/download/")
    public String download(@PathVariable Long backupId){
        return "backup download not implemented in this stub";
    }

    @GetMapping("/backups/generate_instant/")
    public Map<String,String> generateInstant(){
        return Map.of("status","ok");
    }
}
