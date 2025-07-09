import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { colors } from '../../../styles/theme'; // ajustá el path si es distinto

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

  priceRow: {
    flexDirection: 'row',
    gap: 12,
  },

  priceField: {
    flex: 1,
  },

  barcodeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },

  barcodeLabel: {
    fontSize: RFValue(14),
    color: '#6366f1',
    fontWeight: '500',
  },

  barcodeValue: {
    fontSize: RFValue(14),
    color: '#1e293b',
    fontWeight: '600',
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
});
