export class OrderStatus {

  static readonly PENDING = "PENDING";
  static readonly IN_PROGRESS = "IN_PROGRESS";
  static readonly COMPLETED = "COMPLETED";
  static readonly CANCELLED = "CANCELLED";

  static readonly VALUES = [
    OrderStatus.PENDING,
    OrderStatus.IN_PROGRESS,
    OrderStatus.COMPLETED,
    OrderStatus.CANCELLED
  ] as const

  static values() {
    return OrderStatus.VALUES;
  }

  static isValid (metod: string): metod is typeof OrderStatus.VALUES[number]{
    return OrderStatus.VALUES.includes(metod as any)
  }
}