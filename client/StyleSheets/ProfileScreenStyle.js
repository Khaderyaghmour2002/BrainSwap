import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  // Header Section
  headerCurvedBackground: {
    position: "absolute",
    width: "100%",
    height: 200,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
    paddingTop: 20,
    paddingRight: 20,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  settingsIcon: {
    padding: 10,
  },

  // Loader and Error
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorMessage: {
    fontSize: 16,
    color: "red",
  },

  // Profile Section
  profileContainer: {
    paddingTop: 140,
    paddingBottom: 40,
    alignItems: "center",
  },
  profileAvatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarBackground: {
    backgroundColor: "#fff",
    borderRadius: 50,
    padding: 8,
    elevation: 6,
    shadowColor: "#000",
  },
  profileAvatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  profileBio: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginHorizontal: 20,
    marginBottom: 10,
  },

  // Bio Section
  bioContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  editIcon: {
    marginLeft: 10,
  },

  // Stats Section
  profileStatsCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: "90%",
    elevation: 2,
  },
  profileStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  profileStatItem: {
    alignItems: "center",
  },
  profileStatValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginTop: 4,
  },
  profileStatLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },

  // Skills Section
  skillsSection: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    width: "90%",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  skillsPillContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  skillPill: {
    backgroundColor: "#e0f7fa",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  skillPillText: {
    fontSize: 14,
    color: "#00796b",
  },

  // Badges Section
  badgesSection: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    width: "90%",
  },
  badge: {
    alignItems: "center",
    marginRight: 10,
  },
  badgeText: {
    marginTop: 5,
    fontSize: 12,
    color: "#666",
  },

  // Logout Button
  logoutButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 40,
    backgroundColor: "#d32f2f",
    borderRadius: 20,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // Profile Actions
  profileActions: {
    flexDirection: "row",
    marginTop: 10,
  },
  profileActionButton: {
    flex: 1,
    backgroundColor: "#6a11cb",
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
    marginHorizontal: 5,
  },
  profileActionText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  // Reviews Section
  reviewsSection: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    width: "90%",
  },
  reviewItem: {
    marginBottom: 10,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  reviewText: {
    fontSize: 12,
    color: "#555",
  },
  
reviewsSection: {
  marginVertical: 10,
  padding: 15,
  backgroundColor: "#fff",
  borderRadius: 10,
  width: "90%",
  elevation: 2,
},

reviewCard: {
  backgroundColor: "#f9f9ff",
  borderRadius: 10,
  padding: 12,
  marginBottom: 10,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 3,
  elevation: 1,
},

reviewHeader: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 4,
},

reviewAuthor: {
  marginLeft: 8,
  fontSize: 14,
  fontWeight: "600",
  color: "#333",
},

reviewText: {
  fontSize: 13,
  color: "#555",
  lineHeight: 18,
},

postsSection: {
  marginVertical: 10,
  padding: 15,
  backgroundColor: "#fff",
  borderRadius: 10,
  width: "90%",
  alignSelf: "center",
  elevation: 2,
},
postCard: {
  backgroundColor: "#f5f5f5",
  borderRadius: 10,
  padding: 12,
  marginTop: 12,
  elevation: 1,
},
postImage: {
  width: "100%",
  height: 200,
  borderRadius: 8,
  marginTop: 8,
},
postCaption: {
  fontSize: 14,
  color: "#333",
},
postHeaderRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},
deleteIcon: {
  padding: 4,
},
reviewCard: {
  backgroundColor: "#fff",
  borderRadius: 10,
  padding: 12,
  marginVertical: 6,
  elevation: 2,
},

reviewHeader: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 6,
},

reviewerPhoto: {
  width: 36,
  height: 36,
  borderRadius: 18,
  marginRight: 10,
  backgroundColor: "#ddd",
},

reviewAuthor: {
  fontWeight: "600",
  fontSize: 14,
  color: "#333",
},

reviewText: {
  fontSize: 14,
  color: "#555",
  marginLeft: 2,
},
bioModalOverlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.4)",
  justifyContent: "flex-start",
  alignItems: "center",
  paddingTop: 60,
  zIndex: 1000,
},

bioModal: {
  width: "90%",
  backgroundColor: "#fff",
  borderRadius: 10,
  padding: 20,
  elevation: 5,
},

bioModalTitle: {
  fontSize: 18,
  fontWeight: "bold",
  marginBottom: 10,
  textAlign: "center",
},

bioInput: {
  height: 100,
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 8,
  padding: 10,
  textAlignVertical: "top",
  marginBottom: 15,
},

bioModalButtons: {
  flexDirection: "row",
  justifyContent: "space-between",
},

cancelButton: {
  padding: 10,
  backgroundColor: "#ccc",
  borderRadius: 6,
  flex: 1,
  marginRight: 10,
},

saveButton: {
  padding: 10,
  backgroundColor: "#6a11cb",
  borderRadius: 6,
  flex: 1,
},

cancelButtonText: {
  color: "#333",
  textAlign: "center",
  fontWeight: "500",
},

saveButtonText: {
  color: "#fff",
  textAlign: "center",
  fontWeight: "500",
},
reviewerImage: {
  width: 28,
  height: 28,
  borderRadius: 14,
  marginRight: 8,
},
connectionsGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  marginTop: 8,
},

connectionItem: {
  width: "30%",
  alignItems: "center",
  marginVertical: 10,
},

connectionPhoto: {
  width: 60,
  height: 60,
  borderRadius: 30,
  marginBottom: 6,
},

connectionName: {
  fontSize: 14,
  color: "#333",
  textAlign: "center",
},

showMoreText: {
  color: "#6a11cb",
  fontWeight: "600",
  textAlign: "center",
  marginTop: 10,
},


});
