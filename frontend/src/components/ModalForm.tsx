import { EuiButton, EuiButtonEmpty, EuiForm, EuiFormRow, EuiModal, EuiModalBody, EuiModalFooter, EuiModalHeader, EuiModalHeaderTitle, EuiRadioGroup, EuiSelectable, EuiSelectableOption, EuiText, useGeneratedHtmlId } from '@elastic/eui'
import { useMutation } from '@tanstack/react-query';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useCustomStyle } from '../hooks/useCustomStyle';
import { useOwnerData } from '../hooks/useOwnerData';
import { useStockData } from '../hooks/useStockData';
import { supabase } from '../utils/supabase';

export const ModalForm = () => {
  const { titleStyle, subtitleStyle } = useCustomStyle();
  const { data: ownerData } = useOwnerData();
  const { data: stockData } = useStockData();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const closeModal = () => setIsModalVisible(false);
  const showModal = () => setIsModalVisible(true);
  const modalFormId = useGeneratedHtmlId({ prefix: 'modalForm' });

  const [radioIdSelected, setRadioIdSelected] = useState('');
  const onChange = (optionId: string) => {
    setRadioIdSelected(optionId);
  };

  // Prepare the data from the database, in a format the Eui component accepts.
  const getDough = () => {
    if (stockData) {
      const stock = stockData.filter(r => r.ingredient === false);
      const ret: { id: string, label: string, count: number, disabled: boolean }[] = [];
      stock.forEach(r => {
        ret.push({ id: String(r.id), label: r.name, count: r.cnt, disabled: r.cnt === 0 });
      })
      return ret;
    }
    return [];
  }

  // Same for the ingredient data that goes into the selectable component.
  const getIngredients = useCallback(() => {
    if (stockData) {
      const stock = stockData.filter(r => r.ingredient === true);
      const ret: { key: string, label: string, disabled: boolean }[] = [];
      stock.forEach(r => {
        ret.push({ key: String(r.id), label: r.name, disabled: r.cnt === 0 });
      })
      return ret;
    }
    return [];
  }, [stockData]);

  const [options, setOptions] = useState<EuiSelectableOption[]>(getIngredients());

  useEffect(() => {
    if (stockData) { setOptions(getIngredients()); }
  }, [stockData, getIngredients]);

  let modal;

  // Using react-query to save the order into the database using a custom function.
  const submitOrder = useMutation({
    mutationFn: async () => {
      return await supabase.rpc('fn_create_single_order',
        {
          client_id: 1,
          dough_id: parseInt(radioIdSelected),
          ingredient_ids: options.filter(r => r.checked === 'on').map(r => parseInt(r.key as string))
        })
    },
    onSuccess: closeModal
  });

  const submitForm = (e: FormEvent) => {
    submitOrder.mutate();
    e.preventDefault();
  }

  if (isModalVisible) {
    modal = (
      <EuiModal onClose={closeModal}>
        <EuiModalHeader>
          <EuiModalHeaderTitle css={titleStyle}>
            <h1>Order a pizza</h1>
          </EuiModalHeaderTitle>
        </EuiModalHeader>

        <EuiModalBody>
          <EuiText css={subtitleStyle}>
            Howdy{ownerData && ` ${ownerData.name}`}, what type of pizza would you like today?
            <EuiForm style={{ marginTop: 20 }} id={modalFormId} component="form" onSubmit={submitForm}>
              <EuiFormRow label="Select dough">
                <EuiRadioGroup
                  options={getDough()}
                  idSelected={radioIdSelected}
                  onChange={(id) => onChange(id)}
                  name="radio group"
                />
              </EuiFormRow>
              <EuiFormRow label="Select ingredients"><>
                {stockData &&
                  <EuiSelectable
                    aria-label="Basic example"
                    options={options}
                    listProps={{ bordered: true }}
                    onChange={(newOptions) => setOptions(newOptions)}
                  >
                    {list => list}
                  </EuiSelectable>
                }</>
              </EuiFormRow>
            </EuiForm>
          </EuiText>
        </EuiModalBody>

        <EuiModalFooter>
          <EuiButtonEmpty onClick={closeModal}>Cancel</EuiButtonEmpty>
          <EuiButton type="submit" form={modalFormId} color='ghost' >Save</EuiButton>
        </EuiModalFooter>
      </EuiModal>
    );
  }

  return <>
    <EuiButton onClick={showModal} color='ghost' size='s'>Order a pizza</EuiButton>
    {modal}
  </>
}