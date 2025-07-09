import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';

export const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    maxHeight: hp('85%'),
  },

  modalHeader: {
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,

  },

  modalTitle: {
    fontSize: RFValue(18),
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },

  modalBody: {
    padding: 24,
    backgroundColor: '#ffffff',
  },

  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: '#ffffff',

  },

  modalButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalButtonPrimary: {
    backgroundColor: '#2563eb',
  },

  modalButtonSecondary: {
    backgroundColor: '#f8fafc',
  },

  modalButtonDisabled: {
    backgroundColor: '#94a3b8',
  },

  formSection: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: RFValue(16),
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    paddingLeft: 4,
  },

  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },

  inputField: {
    flex: 1,
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },

  loadingText: {
    fontSize: RFValue(14),
    color: '#6366f1',
    fontWeight: '500',
  },

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },

  emptyText: {
    fontSize: RFValue(16),
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },

  emptySubtext: {
    fontSize: RFValue(14),
    color: '#94a3b8',
    textAlign: 'center',
  },

  variantList: {
    gap: 16,
  },

  variantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  variantIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  variantInfo: {
    flex: 1,
  },

  variantName: {
    fontSize: RFValue(15),
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },

  variantStock: {
    fontSize: RFValue(13),
    color: '#64748b',
  },

  variantActions: {
    flexDirection: 'row',
    gap: 8,
  },

  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
