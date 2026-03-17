import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Filter,
  ListingData,
  MessageData,
  RatingData,
  UserProfile,
} from "../backend";
import type { Category, ExternalBlob } from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export interface PaymentData {
  id: bigint;
  buyer: Principal;
  listingId: bigint;
  professionalName: string;
  listingTitle: string;
  amountCOP: bigint;
  stripeSessionId: string;
  status:
    | { __kind__: "pending" }
    | { __kind__: "completed" }
    | { __kind__: "failed" };
  timestamp: bigint;
}

export function useListings(filter: Filter | null) {
  const { actor, isFetching } = useActor();
  return useQuery<ListingData[]>({
    queryKey: ["listings", filter],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getListings(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListing(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<ListingData | null>({
    queryKey: ["listing", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      const listings = await actor.getListings(null);
      return listings.find((l) => l.id === id) ?? null;
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCallerProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const query = useQuery<UserProfile | null>({
    queryKey: ["callerProfile", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("No actor");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

export function useCreateListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      category: Category;
      city: string;
      country: string;
      price: string;
      experienceYears: bigint;
      mainImageId: string;
      additionalImageIds: ExternalBlob[];
      professionalName: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createListing(
        data.title,
        data.description,
        data.category,
        data.city,
        data.country,
        data.price,
        data.experienceYears,
        data.mainImageId,
        data.additionalImageIds,
        data.professionalName,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

export function useUpdateListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      title: string;
      description: string;
      category: Category;
      city: string;
      country: string;
      price: string;
      experienceYears: bigint;
      mainImageId: string;
      additionalImageIds: ExternalBlob[];
      professionalName: string;
      active: boolean;
    }) => {
      if (!actor) throw new Error("No actor");
      await actor.updateListing(
        data.id,
        data.title,
        data.description,
        data.category,
        data.city,
        data.country,
        data.price,
        data.experienceYears,
        data.mainImageId,
        data.additionalImageIds,
        data.professionalName,
        data.active,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

export function useDeleteListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      await actor.deleteListing(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

export function useAverageRating(listingId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<number>({
    queryKey: ["avgRating", listingId?.toString()],
    queryFn: async () => {
      if (!actor || listingId === null) return 0;
      return actor.getAverageRating(listingId);
    },
    enabled: !!actor && !isFetching && listingId !== null,
  });
}

export function useRatings(listingId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<RatingData[]>({
    queryKey: ["ratings", listingId?.toString()],
    queryFn: async () => {
      if (!actor || listingId === null) return [];
      return actor.getRatingsByListing(listingId);
    },
    enabled: !!actor && !isFetching && listingId !== null,
  });
}

export function useAddRating() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      listingId: bigint;
      rating: bigint;
      comment: string;
    }) => {
      if (!actor) throw new Error("No actor");
      await actor.addRating(data.listingId, data.rating, data.comment);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["ratings", vars.listingId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["avgRating", vars.listingId.toString()],
      });
    },
  });
}

export function useConversations() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<Principal[]>({
    queryKey: ["conversations", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getConversations();
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 5000,
  });
}

export function useMessages(otherUser: Principal | null) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<MessageData[]>({
    queryKey: ["messages", otherUser?.toString()],
    queryFn: async () => {
      if (!actor || !otherUser) return [];
      return actor.getMessages(otherUser);
    },
    enabled: !!actor && !isFetching && !!identity && !!otherUser,
    refetchInterval: 3000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { recipient: Principal; content: string }) => {
      if (!actor) throw new Error("No actor");
      await actor.sendMessage(data.recipient, data.content);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", vars.recipient.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useUserProfile(principal: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      return actor.getUserProfile(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: {
      listingId: bigint;
      successUrl: string;
      cancelUrl: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).createCheckoutSession(
        data.listingId,
        data.successUrl,
        data.cancelUrl,
      ) as Promise<string>;
    },
  });
}

export function useConfirmPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (stripeSessionId: string) => {
      if (!actor) throw new Error("No actor");
      await (actor as any).confirmPayment(stripeSessionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myPayments"] });
    },
  });
}

export function useMyPayments() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<PaymentData[]>({
    queryKey: ["myPayments", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getMyPayments() as Promise<PaymentData[]>;
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}
