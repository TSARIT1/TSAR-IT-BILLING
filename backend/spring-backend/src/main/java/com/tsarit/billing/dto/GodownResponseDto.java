package com.tsarit.billing.dto;

import java.time.LocalDateTime;

public class GodownResponseDto {

    private String godownId;
    private String godownName;
    private String location;
    private String managerName;
    private String contactNo;
    private LocalDateTime createdDate;
    private String userBusinessId;

    public GodownResponseDto(
            String godownId,
            String godownName,
            String location,
            String managerName,
            String contactNo,
            LocalDateTime createdDate,
            String userBusinessId
    ) {
        this.godownId = godownId;
        this.godownName = godownName;
        this.location = location;
        this.managerName = managerName;
        this.contactNo = contactNo;
        this.createdDate = createdDate;
        this.userBusinessId = userBusinessId;
    }

	public String getGodownId() {
		return godownId;
	}

	public void setGodownId(String godownId) {
		this.godownId = godownId;
	}

	public String getGodownName() {
		return godownName;
	}

	public void setGodownName(String godownName) {
		this.godownName = godownName;
	}

	public String getLocation() {
		return location;
	}

	public void setLocation(String location) {
		this.location = location;
	}

	public String getManagerName() {
		return managerName;
	}

	public void setManagerName(String managerName) {
		this.managerName = managerName;
	}

	public String getContactNo() {
		return contactNo;
	}

	public void setContactNo(String contactNo) {
		this.contactNo = contactNo;
	}

	public LocalDateTime getCreatedDate() {
		return createdDate;
	}

	public void setCreatedDate(LocalDateTime createdDate) {
		this.createdDate = createdDate;
	}

	public String getUserBusinessId() {
		return userBusinessId;
	}

	public void setUserBusinessId(String userBusinessId) {
		this.userBusinessId = userBusinessId;
	}

   
}

