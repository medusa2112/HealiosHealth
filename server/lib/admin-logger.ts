import { storage } from "../storage";
import type { InsertAdminLog } from "@shared/schema";

export class AdminLogger {
  static async log(
    adminId: string,
    actionType: string,
    targetType: string,
    targetId: string,
    details?: any
  ): Promise<void> {
    try {
      const logData: InsertAdminLog = {
        adminId,
        actionType,
        targetType,
        targetId,
        details: details ? JSON.stringify(details) : null,
      };

      await storage.createAdminLog(logData);
      console.log(`📝 Admin log: ${adminId} performed ${actionType} on ${targetType}:${targetId}`);
    } catch (error) {
      console.error("Failed to create admin log:", error);
      // Don't throw - logging failures shouldn't break admin actions
    }
  }

  // Convenience methods for common actions
  static async logProductAction(
    adminId: string,
    action: "create" | "update" | "delete",
    productId: string,
    details?: any
  ): Promise<void> {
    return this.log(adminId, `${action}_product`, "product", productId, details);
  }

  static async logOrderAction(
    adminId: string,
    action: "refund" | "update_status" | "cancel",
    orderId: string,
    details?: any
  ): Promise<void> {
    return this.log(adminId, `${action}_order`, "order", orderId, details);
  }

  static async logUploadAction(
    adminId: string,
    uploadType: "product_image" | "asset",
    targetId: string,
    details?: any
  ): Promise<void> {
    return this.log(adminId, "upload", uploadType, targetId, details);
  }

  static async logSystemAction(
    adminId: string,
    action: string,
    details?: any
  ): Promise<void> {
    return this.log(adminId, action, "system", "N/A", details);
  }
}