import React, { useCallback, useState } from 'react';
import { Button, InlineLoading, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { deleteProgramEnrollment, useEnrollments } from './programs.resource';
import { showSnackbar } from '@openmrs/esm-framework';

interface DeleteProgramProps {
  closeDeleteModal: () => void;
  programEnrollmentId: string;
  patientUuid: string;
}

const DeleteProgramModal: React.FC<DeleteProgramProps> = ({ closeDeleteModal, programEnrollmentId, patientUuid }) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);
  const { mutateEnrollments } = useEnrollments(patientUuid);

  const handleDelete = useCallback(async () => {
    try {
      setIsDeleting(true);
      const response = await deleteProgramEnrollment(programEnrollmentId, new AbortController());
      if (response.ok) {
        mutateEnrollments();
        closeDeleteModal();
        showSnackbar({
          isLowContrast: true,
          kind: 'success',
          title: t('programDeleted', 'Program Enrollment Deleted'),
        });
      }
    } catch (error) {
      showSnackbar({
        isLowContrast: false,
        kind: 'error',
        title: t('errorDeletingProgram', 'Error deleting program enrollment'),
        subtitle: error?.message,
      });
    } finally {
      setIsDeleting(false);
    }
  }, [closeDeleteModal, programEnrollmentId, t, mutateEnrollments]);

  return (
    <div>
      <ModalHeader closeModal={closeDeleteModal} title={t('deletePatientProgram', 'Delete Program Enrollment')} />
      <ModalBody>
        <p>{t('deleteModalConfirmationText', 'Are you sure you want to delete this program')}</p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeDeleteModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? (
            <InlineLoading description={t('deleting', 'Deleting') + '...'} />
          ) : (
            <span>{t('delete', 'Delete')}</span>
          )}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default DeleteProgramModal;
