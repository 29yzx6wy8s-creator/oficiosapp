import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Filter {
    country?: string;
    city?: string;
    category?: Category;
}
export interface RatingData {
    id: bigint;
    listingId: bigint;
    comment: string;
    timestamp: bigint;
    rating: bigint;
    reviewer: Principal;
}
export interface MessageData {
    id: bigint;
    content: string;
    read: boolean;
    recipient: Principal;
    sender: Principal;
    timestamp: bigint;
}
export interface ListingData {
    id: bigint;
    title: string;
    active: boolean;
    country: string;
    owner: Principal;
    city: string;
    professionalName: string;
    description: string;
    mainImageId: string;
    experienceYears: bigint;
    category: Category;
    price: string;
    additionalImageIds: Array<ExternalBlob>;
}
export interface UserProfile {
    isWorker: boolean;
    name: string;
    isClient: boolean;
    email: string;
}
export enum Category {
    locksmith = "locksmith",
    cleaning = "cleaning",
    other = "other",
    hvac = "hvac",
    plumbing = "plumbing",
    painting = "painting",
    electricity = "electricity",
    gardening = "gardening",
    renovations = "renovations",
    moving = "moving",
    carpentry = "carpentry",
    masonry = "masonry"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addRating(listingId: bigint, rating: bigint, comment: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createListing(title: string, description: string, category: Category, city: string, country: string, price: string, experienceYears: bigint, mainImageId: string, additionalImageIds: Array<ExternalBlob>, professionalName: string): Promise<bigint>;
    deleteListing(id: bigint): Promise<void>;
    getAverageRating(listingId: bigint): Promise<number>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getConversations(): Promise<Array<Principal>>;
    getListings(filter: Filter | null): Promise<Array<ListingData>>;
    getMessages(otherUser: Principal): Promise<Array<MessageData>>;
    getRatingsByListing(listingId: bigint): Promise<Array<RatingData>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markMessageAsRead(messageId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(recipient: Principal, content: string): Promise<void>;
    updateListing(id: bigint, title: string, description: string, category: Category, city: string, country: string, price: string, experienceYears: bigint, mainImageId: string, additionalImageIds: Array<ExternalBlob>, professionalName: string, active: boolean): Promise<void>;
}
