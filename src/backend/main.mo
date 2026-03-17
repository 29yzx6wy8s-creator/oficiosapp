import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";

actor {
  module Listing {
    public type Category = {
      #plumbing;
      #electricity;
      #masonry;
      #painting;
      #carpentry;
      #hvac;
      #gardening;
      #cleaning;
      #renovations;
      #locksmith;
      #moving;
      #other;
    };

    public type ListingData = {
      id : Nat;
      owner : Principal;
      title : Text;
      description : Text;
      category : Category;
      city : Text;
      country : Text;
      price : Text;
      experienceYears : Nat;
      mainImageId : Text;
      additionalImageIds : [Storage.ExternalBlob];
      professionalName : Text;
      active : Bool;
    };
  };

  module Message {
    public type MessageData = {
      id : Nat;
      sender : Principal;
      recipient : Principal;
      content : Text;
      timestamp : Int;
      read : Bool;
    };
  };

  module Rating {
    public type RatingData = {
      id : Nat;
      reviewer : Principal;
      listingId : Nat;
      rating : Nat;
      comment : Text;
      timestamp : Int;
    };
  };

  module Payment {
    public type PaymentStatus = { #pending; #completed; #failed };

    public type PaymentData = {
      id : Nat;
      buyer : Principal;
      listingId : Nat;
      professionalName : Text;
      listingTitle : Text;
      amountCOP : Nat;
      stripeSessionId : Text;
      status : PaymentStatus;
      timestamp : Int;
    };
  };

  module ListingStore {
    public type StoreData = {
      nextListingId : Nat;
      listings : Map.Map<Nat, Listing.ListingData>;
    };

    public func initStoreData() : StoreData {
      {
        nextListingId = 1;
        listings = Map.empty<Nat, Listing.ListingData>();
      };
    };
  };

  module MessageStore {
    public type StoreData = {
      nextMessageId : Nat;
      messages : Map.Map<Nat, Message.MessageData>;
    };

    public func initStoreData() : StoreData {
      {
        nextMessageId = 1;
        messages = Map.empty<Nat, Message.MessageData>();
      };
    };
  };

  module RatingStore {
    public type StoreData = {
      nextRatingId : Nat;
      ratings : Map.Map<Nat, Rating.RatingData>;
    };

    public func initStoreData() : StoreData {
      {
        nextRatingId = 1;
        ratings = Map.empty<Nat, Rating.RatingData>();
      };
    };
  };

  module PaymentStore {
    public type StoreData = {
      nextPaymentId : Nat;
      payments : Map.Map<Nat, Payment.PaymentData>;
    };

    public func initStoreData() : StoreData {
      {
        nextPaymentId = 1;
        payments = Map.empty<Nat, Payment.PaymentData>();
      };
    };
  };

  module CategoryFilter {
    public type Filter = {
      city : ?Text;
      country : ?Text;
      category : ?Listing.Category;
    };
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    isWorker : Bool;
    isClient : Bool;
  };

  // Persistent state
  var _listingStore = ListingStore.initStoreData();
  var _messageStore = MessageStore.initStoreData();
  var _ratingStore = RatingStore.initStoreData();
  var _paymentStore = PaymentStore.initStoreData();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Authorization Component
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Blob Storage Component
  include MixinStorage();

  // Stripe transform function (required for HTTP outcalls)
  public query func stripeTransform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Stripe configuration (keys set via admin)
  var _stripeSecretKey : Text = "";

  public shared ({ caller }) func setStripeSecretKey(key : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can set Stripe key");
    };
    _stripeSecretKey := key;
  };

  // Parse price text to Nat (COP cents = multiply by 100)
  func parsePriceCents(priceText : Text) : Nat {
    // Remove common currency symbols and separators
    var cleaned = priceText
      .replace(#char '$', "")
      .replace(#char ',', "")
      .replace(#char '.', "")
      .trim(#char ' ');
    // Try to parse as Nat
    switch (Nat.fromText(cleaned)) {
      case (?n) { n * 100 }; // convert to cents
      case (null) { 100000 }; // default 1000 COP if parse fails
    };
  };

  // Extract checkout URL from Stripe JSON response
  func extractCheckoutUrl(json : Text) : Text {
    let urlPatterns = ["\"url\":\"", "\"url\": \""];
    for (pattern in urlPatterns.vals()) {
      if (json.contains(#text pattern)) {
        let parts = json.split(#text pattern);
        switch (parts.next()) {
          case (null) {};
          case (?_) {
            switch (parts.next()) {
              case (?afterPattern) {
                switch (afterPattern.split(#text "\"").next()) {
                  case (?url) {
                    if (url.size() > 0) { return url };
                  };
                  case (_) {};
                };
              };
              case (null) {};
            };
          };
        };
      };
    };
    Runtime.trap("Could not parse Stripe checkout URL from response");
  };

  // Extract session ID from Stripe JSON response
  func extractSessionId(json : Text) : Text {
    let idPatterns = ["\"id\":\"", "\"id\": \""];
    for (pattern in idPatterns.vals()) {
      if (json.contains(#text pattern)) {
        let parts = json.split(#text pattern);
        switch (parts.next()) {
          case (null) {};
          case (?_) {
            switch (parts.next()) {
              case (?afterPattern) {
                switch (afterPattern.split(#text "\"").next()) {
                  case (?id) {
                    if (id.size() > 0) { return id };
                  };
                  case (_) {};
                };
              };
              case (null) {};
            };
          };
        };
      };
    };
    Runtime.trap("Could not parse Stripe session ID from response");
  };

  // Payments
  public shared ({ caller }) func createCheckoutSession(listingId : Nat, successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    if (_stripeSecretKey == "") {
      Runtime.trap("Stripe not configured");
    };
    let listing = switch (_listingStore.listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?l) { l };
    };
    let amountCents = parsePriceCents(listing.price);
    let config : Stripe.StripeConfiguration = {
      secretKey = _stripeSecretKey;
      allowedCountries = [];
    };
    let item : Stripe.ShoppingItem = {
      currency = "cop";
      productName = listing.title;
      productDescription = "Servicio de " # listing.professionalName;
      priceInCents = amountCents;
      quantity = 1;
    };
    let response = await Stripe.createCheckoutSession(config, caller, [item], successUrl, cancelUrl, stripeTransform);
    let sessionId = extractSessionId(response);
    let checkoutUrl = extractCheckoutUrl(response);
    // Record payment
    let paymentId = _paymentStore.nextPaymentId;
    let payment : Payment.PaymentData = {
      id = paymentId;
      buyer = caller;
      listingId;
      professionalName = listing.professionalName;
      listingTitle = listing.title;
      amountCOP = amountCents / 100;
      stripeSessionId = sessionId;
      status = #pending;
      timestamp = Time.now();
    };
    _paymentStore.payments.add(paymentId, payment);
    _paymentStore := { _paymentStore with nextPaymentId = paymentId + 1 };
    checkoutUrl;
  };

  public shared ({ caller }) func confirmPayment(stripeSessionId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    if (_stripeSecretKey == "") {
      Runtime.trap("Stripe not configured");
    };
    let config : Stripe.StripeConfiguration = {
      secretKey = _stripeSecretKey;
      allowedCountries = [];
    };
    let sessionStatus = await Stripe.getSessionStatus(config, stripeSessionId, stripeTransform);
    switch (sessionStatus) {
      case (#completed(_)) {
        // Update payment status
        for (payment in _paymentStore.payments.values()) {
          if (payment.stripeSessionId == stripeSessionId) {
            let updated : Payment.PaymentData = { payment with status = #completed };
            _paymentStore.payments.add(payment.id, updated);
          };
        };
      };
      case (#failed(_)) {
        for (payment in _paymentStore.payments.values()) {
          if (payment.stripeSessionId == stripeSessionId) {
            let updated : Payment.PaymentData = { payment with status = #failed };
            _paymentStore.payments.add(payment.id, updated);
          };
        };
      };
    };
  };

  public query ({ caller }) func getMyPayments() : async [Payment.PaymentData] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view payments");
    };
    _paymentStore.payments.values().toArray().filter(
      func(p) { p.buyer == caller }
    );
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Listings
  public shared ({ caller }) func createListing(title : Text, description : Text, category : Listing.Category, city : Text, country : Text, price : Text, experienceYears : Nat, mainImageId : Text, additionalImageIds : [Storage.ExternalBlob], professionalName : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create listings");
    };
    let listingId = _listingStore.nextListingId;
    let listing : Listing.ListingData = {
      id = listingId;
      owner = caller;
      title;
      description;
      category;
      city;
      country;
      price;
      experienceYears;
      mainImageId;
      additionalImageIds;
      professionalName;
      active = true;
    };
    _listingStore.listings.add(listingId, listing);
    _listingStore := {
      _listingStore with
      nextListingId = listingId + 1;
    };
    listingId;
  };

  public shared ({ caller }) func updateListing(id : Nat, title : Text, description : Text, category : Listing.Category, city : Text, country : Text, price : Text, experienceYears : Nat, mainImageId : Text, additionalImageIds : [Storage.ExternalBlob], professionalName : Text, active : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update listings");
    };
    switch (_listingStore.listings.get(id)) {
      case (null) { Runtime.trap("Listing does not exist") };
      case (?listing) {
        if (listing.owner != caller) { Runtime.trap("Unauthorized: Only the owner can update this listing") };
        let updatedListing : Listing.ListingData = {
          id;
          owner = caller;
          title;
          description;
          category;
          city;
          country;
          price;
          experienceYears;
          mainImageId;
          additionalImageIds;
          professionalName;
          active;
        };
        _listingStore.listings.add(id, updatedListing);
      };
    };
  };

  public shared ({ caller }) func deleteListing(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete listings");
    };
    switch (_listingStore.listings.get(id)) {
      case (null) { Runtime.trap("Listing does not exist") };
      case (?listing) {
        if (listing.owner != caller) { Runtime.trap("Unauthorized: Only the owner can delete this listing") };
        _listingStore.listings.remove(id);
      };
    };
  };

  public query ({ caller }) func getListings(filter : ?CategoryFilter.Filter) : async [Listing.ListingData] {
    _listingStore.listings.values().toArray().filter(
      func(listing) {
        switch (filter) {
          case (null) { true };
          case (?f) {
            (switch (f.city, f.country, f.category) {
              case (null, null, null) { true };
              case (?city, null, null) { listing.city == city };
              case (null, ?country, null) { listing.country == country };
              case (null, null, ?category) { listing.category == category };
              case (?city, ?country, null) { listing.city == city and listing.country == country };
              case (?city, null, ?category) { listing.city == city and listing.category == category };
              case (null, ?country, ?category) { listing.country == country and listing.category == category };
              case (?city, ?country, ?category) {
                listing.city == city and listing.country == country and listing.category == category;
              };
            }) and listing.active;
          };
        };
      }
    );
  };

  // Messaging
  public shared ({ caller }) func sendMessage(recipient : Principal, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };
    let message : Message.MessageData = {
      id = _messageStore.nextMessageId;
      sender = caller;
      recipient;
      content;
      timestamp = Time.now();
      read = false;
    };
    _messageStore.messages.add(_messageStore.nextMessageId, message);
    _messageStore := {
      _messageStore with
      nextMessageId = _messageStore.nextMessageId + 1;
    };
  };

  func containsPrincipal(list : List.List<Principal>, value : Principal) : Bool {
    for (item in list.values()) {
      if (item == value) { return true };
    };
    false;
  };

  public query ({ caller }) func getConversations() : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view conversations");
    };
    let conversations = List.empty<Principal>();
    for (message in _messageStore.messages.values()) {
      if (message.sender == caller or message.recipient == caller) {
        if (not containsPrincipal(conversations, message.sender)) {
          conversations.add(message.sender);
        };
        if (not containsPrincipal(conversations, message.recipient)) {
          conversations.add(message.recipient);
        };
      };
    };
    conversations.toArray().filter(func(conversation) { conversation != caller });
  };

  public query ({ caller }) func getMessages(otherUser : Principal) : async [Message.MessageData] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };
    _messageStore.messages.values().toArray().filter(
      func(message) {
        (message.sender == caller and message.recipient == otherUser) or
        (message.sender == otherUser and message.recipient == caller)
      }
    );
  };

  public shared ({ caller }) func markMessageAsRead(messageId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark messages as read");
    };
    switch (_messageStore.messages.get(messageId)) {
      case (null) { Runtime.trap("Message does not exist") };
      case (?message) {
        if (message.recipient != caller) { Runtime.trap("Unauthorized: Only the recipient can mark this message as read") };
        let updatedMessage : Message.MessageData = {
          id = message.id;
          sender = message.sender;
          recipient = message.recipient;
          content = message.content;
          timestamp = message.timestamp;
          read = true;
        };
        _messageStore.messages.add(messageId, updatedMessage);
      };
    };
  };

  // Ratings
  public shared ({ caller }) func addRating(listingId : Nat, rating : Nat, comment : Text) : async Int {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add ratings");
    };
    if (rating < 1 or rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };

    let ratingId = _ratingStore.nextRatingId;
    let newRating : Rating.RatingData = {
      id = ratingId;
      reviewer = caller;
      listingId;
      rating;
      comment;
      timestamp = Time.now();
    };

    let existingRating = _ratingStore.ratings.values().find(
      func(r) { r.reviewer == caller and r.listingId == listingId }
    );
    if (existingRating != null) {
      Runtime.trap("User has already rated this listing");
    };

    _ratingStore.ratings.add(ratingId, newRating);
    _ratingStore := {
      _ratingStore with
      nextRatingId = ratingId + 1;
    };
    ratingId;
  };

  public query ({ caller }) func getRatingsByListing(listingId : Nat) : async [Rating.RatingData] {
    _ratingStore.ratings.values().toArray().filter(
      func(r) { r.listingId == listingId }
    );
  };

  public query ({ caller }) func getAverageRating(listingId : Nat) : async Float {
    let listingRatings = _ratingStore.ratings.values().toArray().filter(
      func(r) { r.listingId == listingId }
    );
    let numRatings = listingRatings.size();
    if (numRatings == 0) { return 0 };
    let sum = listingRatings.foldLeft(
      0,
      func(acc, r) { acc + r.rating },
    );
    sum.toFloat() / numRatings.toFloat();
  };
};
