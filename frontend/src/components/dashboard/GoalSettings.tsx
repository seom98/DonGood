"use client";

import { useState, useEffect, useCallback } from "react";
import styled from "@emotion/styled";
import { getCurrentUserGoal, upsertUserGoal } from "@/lib/api/goals";
import { UserGoal, CreateUserGoalData } from "@/types/goals";

const GoalSettingsContainer = styled.div`
    background: var(--grey025);
    border-radius: 20px;
    padding: 30px;
    border: 1px solid var(--grey200);
`;

const GoalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
`;

const GoalTitle = styled.h3`
    margin: 0;
    color: #333;
    font-size: 1.3rem;
`;

const EditButton = styled.button`
    background: #667eea;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.3s ease;

    &:hover {
        background: #5a6fd8;
    }
`;

const Message = styled.div<{ type: "success" | "error" }>`
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 300;
    background: ${({ type }) =>
        type === "success" ? "var(--coral100)" : "var(--red100)"};
    border: 1px solid
        ${({ type }) =>
            type === "success" ? "var(--coral200)" : "var(--red200)"};
    color: ${({ type }) =>
        type === "success" ? "var(--coral400)" : "var(--red400)"};
`;

const GoalContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const GoalItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const GoalLabel = styled.label`
    font-weight: 600;
    color: #333;
    font-size: 0.95rem;
`;

const InputGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const GoalInput = styled.input`
    flex: 1;
    padding: 10px 12px;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s ease;

    &:focus {
        outline: none;
        border-color: #667eea;
    }
`;

const Currency = styled.span`
    color: #666;
    font-weight: 500;
    min-width: 20px;
`;

const GoalDisplay = styled.div`
    padding: 10px 12px;
    background: #f8f9fa;
    border-radius: 8px;
    color: #333;
    font-weight: 500;
    font-size: 1rem;
`;

const ExpenseTypeSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const ExpenseTypeTitle = styled.h4`
    margin: 0;
    color: #333;
    font-size: 1.1rem;
`;

const ExpenseTypeOptions = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
`;

const ExpenseTypeOption = styled.label`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: #667eea;
        background: #f8f9fa;
    }

    input[type="checkbox"] {
        width: 18px;
        height: 18px;
        accent-color: #667eea;
    }
`;

const GoalActions = styled.div`
    display: flex;
    gap: 12px;
    margin-top: 20px;
`;

const SaveButton = styled.button`
    background: #28a745;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.3s ease;
    flex: 1;

    &:hover:not(:disabled) {
        background: #218838;
    }

    &:disabled {
        background: #6c757d;
        cursor: not-allowed;
    }
`;

const CancelButton = styled.button`
    background: #6c757d;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.3s ease;
    flex: 1;

    &:hover:not(:disabled) {
        background: #5a6268;
    }

    &:disabled {
        background: #adb5bd;
        cursor: not-allowed;
    }
`;

export default function GoalSettings() {
    const [dailyGoal, setDailyGoal] = useState<number>(0);
    const [includeGeneralExpense, setIncludeGeneralExpense] =
        useState<boolean>(false);
    const [includeFixedExpense, setIncludeFixedExpense] =
        useState<boolean>(false);
    const [includeWasteExpense, setIncludeWasteExpense] =
        useState<boolean>(false);
    const [includeSpecialExpense, setIncludeSpecialExpense] =
        useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [existingGoalId, setExistingGoalId] = useState<string | null>(null);

    const fetchGoals = useCallback(async () => {
        try {
            const response = await getCurrentUserGoal();

            if (!response.success) {
                console.error("목표 조회 오류:", response.error);
                return;
            }

            if (response.data) {
                console.log("가져온 목표 데이터:", response.data);
                setDailyGoal(response.data.daily_goal);
                setIncludeGeneralExpense(response.data.include_general_expense);
                setIncludeFixedExpense(response.data.include_fixed_expense);
                setIncludeWasteExpense(response.data.include_waste_expense);
                setIncludeSpecialExpense(response.data.include_special_expense);
                setExistingGoalId(response.data.id);
            }
        } catch (error) {
            console.error("목표 조회 중 오류:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGoals();
    }, [fetchGoals]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            // 저장할 데이터 준비
            const saveData: CreateUserGoalData = {
                daily_goal: dailyGoal,
                include_general_expense: includeGeneralExpense,
                include_fixed_expense: includeFixedExpense,
                include_waste_expense: includeWasteExpense,
                include_special_expense: includeSpecialExpense,
            };
            console.log("저장할 데이터:", saveData);

            // 목표 설정 생성 또는 수정
            const response = await upsertUserGoal(saveData);

            if (!response.success) {
                throw new Error(response.error || "목표 저장에 실패했습니다.");
            }

            setMessage("목표가 성공적으로 저장되었습니다!");
            // 저장 후 목표 다시 불러오기
            await fetchGoals();
        } catch (error) {
            console.error("목표 저장 오류:", error);
            const errorMessage =
                error instanceof Error ? error.message : "알 수 없는 오류";
            setMessage(`목표 저장 중 오류가 발생했습니다: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    if (isLoading) {
        return <div>로딩 중...</div>;
    }

    return (
        <GoalSettingsContainer>
            <GoalHeader>
                <GoalTitle>목표 설정</GoalTitle>
                <EditButton>편집</EditButton>
            </GoalHeader>

            {message && (
                <Message type={message.includes("성공") ? "success" : "error"}>
                    {message}
                </Message>
            )}

            <form onSubmit={handleSubmit}>
                <GoalContent>
                    <GoalItem>
                        <GoalLabel>일간 목표</GoalLabel>
                        <InputGroup>
                            <GoalInput
                                type="number"
                                value={dailyGoal}
                                onChange={(e) =>
                                    setDailyGoal(Number(e.target.value))
                                }
                                placeholder="일간 목표 금액을 입력하세요"
                                min="0"
                            />
                            <Currency>원</Currency>
                        </InputGroup>
                    </GoalItem>

                    <ExpenseTypeSection>
                        <ExpenseTypeTitle>
                            목표에 포함할 소비형태
                        </ExpenseTypeTitle>
                        <ExpenseTypeOptions>
                            <ExpenseTypeOption>
                                <input
                                    type="checkbox"
                                    checked={includeGeneralExpense}
                                    onChange={(e) =>
                                        setIncludeGeneralExpense(
                                            e.target.checked
                                        )
                                    }
                                />
                                <span>일반지출</span>
                            </ExpenseTypeOption>
                            <ExpenseTypeOption>
                                <input
                                    type="checkbox"
                                    checked={includeFixedExpense}
                                    onChange={(e) =>
                                        setIncludeFixedExpense(e.target.checked)
                                    }
                                />
                                <span>고정지출</span>
                            </ExpenseTypeOption>
                            <ExpenseTypeOption>
                                <input
                                    type="checkbox"
                                    checked={includeWasteExpense}
                                    onChange={(e) =>
                                        setIncludeWasteExpense(e.target.checked)
                                    }
                                />
                                <span>낭비지출</span>
                            </ExpenseTypeOption>
                            <ExpenseTypeOption>
                                <input
                                    type="checkbox"
                                    checked={includeSpecialExpense}
                                    onChange={(e) =>
                                        setIncludeSpecialExpense(
                                            e.target.checked
                                        )
                                    }
                                />
                                <span>특수지출</span>
                            </ExpenseTypeOption>
                        </ExpenseTypeOptions>
                    </ExpenseTypeSection>
                </GoalContent>

                <GoalActions>
                    <SaveButton type="submit" disabled={loading}>
                        {loading ? "저장 중..." : "저장"}
                    </SaveButton>
                    <CancelButton
                        type="button"
                        onClick={() => fetchGoals()}
                        disabled={loading}
                    >
                        취소
                    </CancelButton>
                </GoalActions>
            </form>
        </GoalSettingsContainer>
    );
}
