import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

export const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
  },

  modalContent: {
    width: '100%',
    maxWidth: wp('90%'),
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

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },

  errorText: {
    fontSize: RFValue(14),
    color: '#ef4444',
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

  materialSelector: {
    marginBottom: 20,
  },

  selectorLabel: {
    fontSize: RFValue(14),
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 12,
  },

  materialScroll: {
    maxHeight: 200,
  },

  materialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  materialCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    width: wp('48%'),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  materialCardSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },

  materialIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },

  materialName: {
    fontSize: RFValue(11),
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 3,
  },

  materialPrice: {
    fontSize: RFValue(10),
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 1,
  },

  materialUnit: {
    fontSize: RFValue(9),
    color: '#64748b',
  },

  quantitySection: {
    marginTop: 16,
  },

  quantityLabel: {
    fontSize: RFValue(14),
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 8,
  },

  componentScroll: {
    maxHeight: 200,
  },

  componentGrid: {
    gap: 8,
  },

  componentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  componentIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  componentInfo: {
    flex: 1,
  },

  componentName: {
    fontSize: RFValue(13),
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },

  componentDetails: {
    fontSize: RFValue(11),
    color: '#64748b',
  },

  componentPrice: {
    alignItems: 'flex-end',
    marginRight: 10,
  },

  priceText: {
    fontSize: RFValue(12),
    fontWeight: '700',
    color: '#2563eb',
  },

  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
