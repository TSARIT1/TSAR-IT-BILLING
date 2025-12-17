package com.tsarit.billing.dto;

public class GodownRequestDto {

    private String godownId;
    private String godownName;
    private String location;
    private String managerName;
    private String contactNo;
   private String userBusinessId;
    
    // Getters & Setters
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

	public String getUserBusinessId() {
		return userBusinessId;
	}

	public void setUserBusinessId(String userBusinessId) {
		this.userBusinessId = userBusinessId;
	}

    
	
	}
    

