import axios from 'axios';
import { API_URL } from '../config';
import {
  AuditLog,
  DataRetentionPolicy,
  AuditLogSearchParams,
  AuditLogSearchResult,
  CreateDataRetentionPolicyDto,
  UpdateDataRetentionPolicyDto,
  ComplianceReportParams,
  ComplianceReport,
} from '../types/compliance';

const API_ENDPOINT = `${API_URL}/compliance`;

export const ComplianceService = {
  // Audit log methods
  async createAuditLog(data: Partial<AuditLog>): Promise<AuditLog> {
    const response = await axios.post<AuditLog>(`${API_ENDPOINT}/audit-logs`, data);
    return response.data;
  },

  async searchAuditLogs(params: AuditLogSearchParams): Promise<AuditLogSearchResult> {
    const response = await axios.get<AuditLogSearchResult>(`${API_ENDPOINT}/audit-logs`, {
      params,
    });
    return response.data;
  },

  async getAuditLogById(id: string): Promise<AuditLog> {
    const response = await axios.get<AuditLog>(`${API_ENDPOINT}/audit-logs/${id}`);
    return response.data;
  },

  // Data retention policy methods
  async createDataRetentionPolicy(
    data: CreateDataRetentionPolicyDto
  ): Promise<DataRetentionPolicy> {
    const response = await axios.post<DataRetentionPolicy>(
      `${API_ENDPOINT}/retention-policies`,
      data
    );
    return response.data;
  },

  async getAllDataRetentionPolicies(): Promise<DataRetentionPolicy[]> {
    const response = await axios.get<DataRetentionPolicy[]>(
      `${API_ENDPOINT}/retention-policies`
    );
    return response.data;
  },

  async getDataRetentionPolicyById(id: string): Promise<DataRetentionPolicy> {
    const response = await axios.get<DataRetentionPolicy>(
      `${API_ENDPOINT}/retention-policies/${id}`
    );
    return response.data;
  },

  async updateDataRetentionPolicy(
    id: string,
    data: UpdateDataRetentionPolicyDto
  ): Promise<DataRetentionPolicy> {
    const response = await axios.patch<DataRetentionPolicy>(
      `${API_ENDPOINT}/retention-policies/${id}`,
      data
    );
    return response.data;
  },

  async deleteDataRetentionPolicy(id: string): Promise<void> {
    await axios.delete(`${API_ENDPOINT}/retention-policies/${id}`);
  },

  // Compliance report methods
  async generateComplianceReport(params: ComplianceReportParams): Promise<ComplianceReport> {
    const response = await axios.post<ComplianceReport>(`${API_ENDPOINT}/reports`, params);
    return response.data;
  },

  // Manual execution of data retention policies
  async executeDataRetentionPolicies(): Promise<void> {
    await axios.post(`${API_ENDPOINT}/retention-policies/execute`);
  },
}; 