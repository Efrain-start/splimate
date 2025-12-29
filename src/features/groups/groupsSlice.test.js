/* eslint-env jest */
import reducer, {
  addGroup,
  addMemberToGroup,
  addExpenseToGroup,
  removeExpenseFromGroup,
  settleGroup,
  reopenGroup,
} from "./groupsSlice";

describe("groupsSlice", () => {
  test("addGroup crea un grupo con members y expenses vacíos", () => {
    const initial = { list: [] };

    const next = reducer(initial, addGroup({ name: "Viaje Gto" }));

    expect(next.list).toHaveLength(1);
    expect(next.list[0].name).toBe("Viaje Gto");
    expect(next.list[0].members).toEqual([]);
    expect(next.list[0].expenses).toEqual([]);
    expect(next.list[0].id).toBeTruthy();
  });

  test("addMemberToGroup agrega miembro y evita duplicados", () => {
    const initial = {
      list: [{ id: 1, name: "Grupo", members: [], expenses: [] }],
    };

    let next = reducer(
      initial,
      addMemberToGroup({ groupId: 1, memberName: "Efra" })
    );
    next = reducer(next, addMemberToGroup({ groupId: 1, memberName: "efra" })); // duplicado

    expect(next.list[0].members).toEqual(["Efra"]);
  });

  test("addExpenseToGroup agrega gasto válido y removeExpenseFromGroup lo elimina", () => {
    const initial = {
      list: [
        {
          id: 1,
          name: "Grupo",
          members: ["Efra", "Ale"],
          expenses: [],
        },
      ],
    };

    const addAction = addExpenseToGroup({
      groupId: 1,
      description: "Gasolina",
      amount: 1200,
      paidBy: "Efra",
      splitBetween: ["Efra", "Ale"],
    });

    const afterAdd = reducer(initial, addAction);

    expect(afterAdd.list[0].expenses).toHaveLength(1);
    const expenseId = afterAdd.list[0].expenses[0].id;
    expect(afterAdd.list[0].expenses[0].description).toBe("Gasolina");

    const afterRemove = reducer(
      afterAdd,
      removeExpenseFromGroup({ groupId: 1, expenseId })
    );

    expect(afterRemove.list[0].expenses).toHaveLength(0);
  });

  test("settleGroup marca el grupo como liquidado (isSettled = true)", () => {
    const initial = {
      list: [
        { id: 1, name: "Grupo", members: [], expenses: [], isSettled: false },
      ],
    };

    const next = reducer(initial, settleGroup({ groupId: 1 }));

    expect(next.list[0].isSettled).toBe(true);
  });

  test("reopenGroup reabre el grupo (isSettled = false)", () => {
    const initial = {
      list: [
        { id: 1, name: "Grupo", members: [], expenses: [], isSettled: true },
      ],
    };

    const next = reducer(initial, reopenGroup({ groupId: 1 }));

    expect(next.list[0].isSettled).toBe(false);
  });
});
