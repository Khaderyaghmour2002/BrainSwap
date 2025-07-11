import { StyleSheet } from 'react-native';
import { colors } from '../assets/constants';
import { Platform } from 'react-native';
const styles = StyleSheet.create({

  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 5 },
  postContainer: {
    marginVertical: 10,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 10,
    elevation: 2,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ccc' },
  userName: { marginLeft: 8, fontWeight: '600', fontSize: 16 },
  timestamp: { marginLeft: 8, fontSize: 12, color: '#777' },
  postImage: { width: '100%', height: 300 },
  caption: { padding: 10, fontSize: 14, color: '#333' },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#f4f4f4',
  },
  fileName: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
    color: '#333',
  },
  openFile: {
    color: colors.teal,
    fontWeight: '600',
  },
  fullModal: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  fullImage: {
    width: '100%',
    height: '50%',
    resizeMode: 'cover',
    borderRadius: 10,
    marginBottom: 10,
  },
  captionContainer: {
    flex: 1,
    backgroundColor: '#111',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  captionInputFull: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
    textAlignVertical: 'top',
  },
  uploadButtonFull: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    marginBottom: 10,
  },
  actionsRow: {
  flexDirection: 'row',
  justifyContent: 'flex-start',
  padding: 10,
  gap: 10,
},
requestButton: {
  backgroundColor: colors.primary,
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 6,
},
pendingButton: {
  backgroundColor: '#ccc',
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 6,
},
buttonText: {
  color: '#fff',
  fontWeight: '600',
},
connectIconButton: {
  marginRight: 8,
  backgroundColor: colors.primary,
  width: 32,
  height: 32,
  borderRadius: 16,
  justifyContent: 'center',
  alignItems: 'center',
},
pendingButtonSmall: {
  marginRight: 8,
  backgroundColor: '#ccc',
  width: 32,
  height: 32,
  borderRadius: 16,
  justifyContent: 'center',
  alignItems: 'center',
},
buttonTextSmall: {
  fontSize: 16,
  color: '#fff',
},
postHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 10,
},
headerLeft: {
  flexDirection: 'row',
  alignItems: 'center',
},
connectIconButton: {
  backgroundColor: colors.primary,
  width: 32,
  height: 32,
  borderRadius: 16,
  justifyContent: 'center',
  alignItems: 'center',
},
pendingButtonSmall: {
  backgroundColor: '#ccc',
  width: 32,
  height: 32,
  borderRadius: 16,
  justifyContent: 'center',
  alignItems: 'center',
},
buttonTextSmall: {
  fontSize: 16,
  color: '#fff',
},
connectButton: {
  backgroundColor: colors.primary,
  margin: 10,
  paddingVertical: 8,
  borderRadius: 8,
  alignItems: 'center',
},
connectText: {
  color: '#fff',
  fontWeight: '600',
  fontSize: 15,
},

likeText: {
  fontSize: 16,
  color: 'red',
  marginRight: 50,
},
commentSection: {
  paddingHorizontal: 12,
  paddingBottom: 12,
},
comment: {
  fontSize: 14,
  marginTop: 4,
},

actionButton: {
  flexDirection: 'row',
  alignItems: 'center',
  marginRight: 16,
},

actionText: {
  fontSize: 14,
  color: '#333',
},

commentInputRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 8,
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  paddingHorizontal: 10,
  paddingVertical: Platform.OS === 'ios' ? 8 : 4,
},

commentInputText: {
  flex: 1,
  fontSize: 14,
  color: '#333',
  marginRight: 8,
},
searchContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#f2f2f2',
  borderRadius: 12,
  marginHorizontal: 16,
  paddingHorizontal: 12,
  paddingVertical: 8,
  marginBottom: 10,
  marginTop: 10,
},

searchInput: {
  marginLeft: 8,
  fontSize: 14,
  flex: 1,
  color: '#333',
},
commentRow: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  marginTop: 8,
  gap: 10,
},

commentName: {
  fontWeight: 'bold',
  fontSize: 14,
  color: '#333',
},
commentText: {
  fontSize: 14,
  color: '#444',
},

commentRow: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  marginTop: 12,
  gap: 10,
},

commentHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},
commentUsername: {
  fontWeight: '600',
  fontSize: 14,
  color: '#333',
},
commentTime: {
  fontSize: 12,
  color: '#999',
},
commentContent: {
  fontSize: 14,
  color: '#444',
  marginTop: 2,
},
searchContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 10,
  marginHorizontal: 16,
  borderRadius: 8,
  backgroundColor: '#f2f2f2',
  marginTop: 10,
},
searchInput: {
  flex: 1,
  marginLeft: 8,
  fontSize: 16,
  color: '#333',
},
searchUserRow: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 10,
  backgroundColor: '#fff',
  borderBottomWidth: 1,
  borderColor: '#eee',
},
userName: {
  fontWeight: 'bold',
  fontSize: 16,
  color: '#333',
},
userSkill: {
  color: '#666',
  fontSize: 13,
  marginTop: 2,
},

modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },


  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  commentList: {
    flex: 1,
    padding: 10,
  },

  commentRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },

 

  commentContentWrapper: {
    flex: 1,
  },

  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  commentUsername: {
    fontWeight: 'bold',
    fontSize: 15,
  },

  commentTime: {
    fontSize: 12,
    color: '#888',
  },

  commentContent: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
  },

  commentInputText: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  sendButton: {
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#2196F3', // replace with your custom color if needed
    marginTop: Platform.OS === 'ios' ? 0 : 0, // Adjust for iOS status bar
      justifyContent: 'space-between', // This pushes the icon to the right
      paddingHorizontal: 12,
      paddingVertical: 8,

  },
  headerTitle: {
    color: '#fff',
    fontSize: 25,
    fontWeight: 'bold',
    marginLeft: 10,
    marginTop: Platform.OS === 'ios' ? 30 : 0, // Adjust for iOS status bar
  },
  addButton: {
  position: 'absolute',
  top: Platform.OS === 'ios' ? 27 : 40,
  right: 1,

  borderRadius: 25,
  padding: 8,
  elevation: 5,
  zIndex: 100,
},

  
  commentList: {
    flex: 1,
    padding: 10,
  },
  commentRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },

  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  commentUsername: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  commentTime: {
    fontSize: 12,
    color: '#888',
  },
  commentContent: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
  },
  commentInputText: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },


commentContainer: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  marginBottom: 12,
},

commentAvatar: {
  width: 40,
  height: 40,
  borderRadius: 20,
  marginRight: 10,
},

commentContentWrapper: {
  flex: 1,
  backgroundColor: '#f2f2f2',
  borderRadius: 10,
  padding: 10,
},

commentHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 4,
  marginTop: 10,
},

commentUsername: {
  fontWeight: '600',
  fontSize: 14,
  color: '#333',
},

commentTime: {
  fontSize: 12,
  color: '#999',
},



commentInputContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 10,
  paddingVertical: 6,
  backgroundColor: '#fff',
  borderTopWidth: 1,
  borderColor: '#ddd',
},

commentInput: {
  flex: 1,
  height: 40,
  backgroundColor: '#f0f0f0',
  borderRadius: 20,
  paddingHorizontal: 15,
  fontSize: 14,
  marginRight: 8,
},


commentList: {
  padding: 12,
  backgroundColor: '#fff',
},

commentRow: {
  flexDirection: 'row',
  marginBottom: 16,
},

commentAvatar: {
  width: 40,
  height: 40,
  borderRadius: 20,
  marginRight: 10,
},

commentContentWrapper: {
  flex: 1,
  backgroundColor: '#f4f4f4',
  borderRadius: 10,
  padding: 10,
},

commentHeaderRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 4,
},

commentUsername: {
  fontWeight: '600',
  fontSize: 15,
  color: '#333',
},

commentTime: {
  fontSize: 12,
  color: '#999',
},

commentText: {
  fontSize: 14,
  color: '#444',
},

inputRow: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 12,
  borderTopWidth: 1,
  borderColor: '#ddd',
  backgroundColor: '#fafafa',
},

input: {
  flex: 1,
  backgroundColor: '#fff',
  borderRadius: 25,
  paddingHorizontal: 16,
  paddingVertical: Platform.OS === 'ios' ? 10 : 6,
  fontSize: 15,
  borderWidth: 1,
  borderColor: '#ddd',
  marginRight: 8,
},
fixedInput: {
  position: 'absolute',
  bottom: 0,          
  left: 0,
  right: 0,
},


});
export default styles;
// This file contains styles for the HomeContentScreen component, including styles for the header, post container, modal, and various buttons and text elements.