export class Vendor {
    constructor(
        public vendorId: number = 0,
        public vendorName: string = '',
        public contactNo: string = '',
        public emailId: string = '',
        public district: string = '',
        public state: string = '',
        public pinCode: string = '',

        public vendorProfilePic?: VendorProfilePic,
        public vendorBankDetails?: VendorBankDetails
    ) { }

    static fromJson(json: any): Vendor {
        return new Vendor(
            json.vendorId,
            json.vendorName,
            json.contactNo,
            json.emailId,
            json.district,
            json.state,
            json.pinCode,
            json.vendorProfilePic ? VendorProfilePic.fromJson(json.vendorProfilePic) : undefined,
            json.vendorBankDetails ? VendorBankDetails.fromJson(json.vendorBankDetails) : undefined
        );
    }


}

export class VendorProfilePic {
    constructor(
        public id: number,
        public vendorId: number,
        public imageData: string
    ) { }

    static fromJson(json: any): VendorProfilePic {
        return new VendorProfilePic(json.id, json.vendorId, json.imageData);
    }
}



export class VendorBankDetails {
    constructor(
        public vendorBankDetailsId: number,
        public bankAccountNumber: string,
        public ifscCode: string,
        public bankName: string,
        public accountHolderName: string,
        public upiid: string,
        public isBankVerified: boolean,
        public verificationDate: Date | null,
        public pan: string,
        public vendorId: number
    ) { }

    get maskedAccountNumber(): string {
        return this.bankAccountNumber.replace(/\d(?=\d{4})/g, "*");
    }

    static fromJson(json: any): VendorBankDetails {
        return new VendorBankDetails(
            json.vendorBankDetailsId,
            json.bankAccountNumber,
            json.ifscCode,
            json.bankName,
            json.accountHolderName,
            json.upiid,
            json.isBankVerified,
            json.verificationDate ? new Date(json.verificationDate) : null,
            json.pan,
            json.vendorId,

        )
    }
}