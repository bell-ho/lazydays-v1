// @ts-nocheck
import jsonpatch from 'fast-json-patch';
import { useMutation } from 'react-query';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
// import { toast } from '@chakra-ui/react';
import { useCustomToast } from '../../app/hooks/useCustomToast';
import { useUser } from './useUser';

// for when we need a server function
async function patchUserOnServer(
  newData: User | null,
  originalData: User | null,
): Promise<User | null> {
  if (!newData || !originalData) return null;
  // create a patch for the difference between newData and originalData
  const patch = jsonpatch.compare(originalData, newData);

  // send patched data to the server
  const { data } = await axiosInstance.patch(
    `/user/${originalData.id}`,
    { patch },
    {
      headers: getJWTHeader(originalData),
    },
  );
  return data.user;
}

// TODO: update type to UseMutateFunction type
export function usePatchUser(): (newData: User | null) => void {
  const { user, updateUser } = useUser();

  const toast = useCustomToast();

  const { mutate: patchUser } = useMutation(
    (newUserData) => patchUserOnServer(newUserData, user),
    {
      onSuccess: (userData) => {
        if (!userData) {
          updateUser(userData);
          toast({ title: '사용자 수정', status: 'success' });
        }
      },
    },
  );

  return patchUser;
}
