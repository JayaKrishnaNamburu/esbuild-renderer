import React, { useEffect, useState } from "react";
import ReactModal from "react-modal";
import { store } from "./utils";

export const Modal = () => {
  const [isOpen, setState] = useState(store.app.value.modal.value);

  useEffect(() => {
    const sub1 = store.app.value.modal.subscribe((val) => {
      setState(val);
    });

    return () => {
      sub1.unsubscribe();
    };
  }, []);

  return (
    <ReactModal isOpen={isOpen}>
      <div>
        <button
          onClick={() => {
            store.app.value.modal.next(false);
          }}
        >
          Close
        </button>
      </div>
    </ReactModal>
  );
};
