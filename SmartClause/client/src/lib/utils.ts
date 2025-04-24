import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
}

// Risk level color utility
export function getRiskColor(riskLevel: string): string {
  switch (riskLevel.toLowerCase()) {
    case 'low':
      return 'text-green-500 bg-green-100';
    case 'medium':
      return 'text-yellow-500 bg-yellow-100';
    case 'high':
      return 'text-red-500 bg-red-100';
    default:
      return 'text-gray-500 bg-gray-100';
  }
}

export function getRiskLevelText(riskLevel: string): string {
  switch (riskLevel.toLowerCase()) {
    case 'low':
      return 'Low Risk';
    case 'medium':
      return 'Medium Risk';
    case 'high':
      return 'High Risk';
    default:
      return 'Unknown Risk';
  }
}

export function getFileIcon(fileType: string): string {
  switch (fileType.toLowerCase()) {
    case 'pdf':
      return 'file-pdf';
    case 'docx':
    case 'doc':
      return 'file-word';
    case 'xlsx':
    case 'xls':
      return 'file-excel';
    case 'pptx':
    case 'ppt':
      return 'file-powerpoint';
    default:
      return 'file-text';
  }
}

// Function to extract text from PDF or DOCX (mock implementation)
export async function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      // In a real implementation, we would use PyMuPDF or python-docx on the backend
      // Here we'll just return the first portion of the file as mock text
      
      // For the mock implementation, just return a sample contract text
      const mockContractText = `SERVICE AGREEMENT

THIS SERVICE AGREEMENT (the "Agreement") is made and entered into as of [DATE] (the "Effective Date") by and between [CLIENT NAME], a [STATE] [TYPE OF ENTITY] ("Client"), and [SERVICE PROVIDER NAME], a [STATE] [TYPE OF ENTITY] ("Contractor").

1. SERVICES

1.1 Services. Contractor shall provide to Client the services described in each Statement of Work executed by the parties (the "Services").

1.2 Statements of Work. Each Statement of Work shall include, at a minimum: (a) a description of the Services to be performed; (b) the timeline for performance; and (c) the fees and payment schedule.

2. COMPENSATION

2.1 Fees. Client shall pay to Contractor the fees specified in each Statement of Work.

2.2 Expenses. Client shall reimburse Contractor for all pre-approved, reasonable expenses incurred by Contractor in connection with the performance of the Services.

2.3 Payment Terms. Contractor shall invoice Client on a monthly basis for all fees and expenses. Client shall pay all undisputed amounts within thirty (30) days of receipt of each invoice.

3. TERM AND TERMINATION

3.1 Term. This Agreement shall commence on the Effective Date and continue until terminated as provided herein.

3.2 Termination for Convenience. Either party may terminate this Agreement or any Statement of Work at any time upon thirty (30) days' prior written notice to the other party.

3.3 Termination for Cause. Either party may terminate this Agreement immediately upon written notice to the other party if the other party materially breaches this Agreement and fails to cure such breach within fifteen (15) business days after receiving written notice thereof.

4. CONFIDENTIALITY

4.1 Confidential Information. Each party acknowledges that it may be furnished with or may otherwise receive or have access to information or material that relates to past, present, or future products, software, research, development, inventions, processes, techniques, designs, or technical information and data, and marketing plans (hereinafter the "Confidential Information").

4.2 Non-Disclosure. Each party agrees not to disclose the other party's Confidential Information to any third party and to protect the confidentiality of the Confidential Information with the same degree of care as it uses to protect its own confidential information of like nature.

5. INTELLECTUAL PROPERTY

5.1 Client Materials. Client owns all right, title and interest in and to any materials provided by Client to Contractor (the "Client Materials").

5.2 Deliverables. Upon full payment of all fees due under this Agreement, Contractor assigns to Client all right, title and interest in and to the deliverables specified in each Statement of Work (the "Deliverables").

6. NON-COMPETE

6.1 Contractor agrees not to engage in any business activity competitive with Client's business for a period of five (5) years in any geographic location where Client conducts business.

7. INDEMNIFICATION

7.1 Contractor shall indemnify, defend, and hold harmless Client from any and all claims, damages, liabilities, costs, and expenses, including reasonable attorneys' fees arising from or relating to Contractor's services.

8. MISCELLANEOUS

8.1 Independent Contractor. Contractor is an independent contractor, and nothing in this Agreement shall be construed as creating an employer-employee relationship.

8.2 Governing Law. This Agreement shall be governed by and construed in accordance with the laws of the State of [STATE], without regard to its conflict of laws principles.

8.3 Entire Agreement. This Agreement constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior or contemporaneous agreements or understandings, whether written or oral.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.

CLIENT
By:_______________________
Name:____________________
Title:_____________________

CONTRACTOR
By:_______________________
Name:____________________
Title:_____________________`;

      resolve(mockContractText);
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
}
