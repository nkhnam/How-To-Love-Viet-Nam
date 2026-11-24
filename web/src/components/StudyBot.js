// StudyBot.js
import React, { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

const StudyBot = ({ onTaskScheduled }) => {
    const [step, setStep] = useState(1);
    const [subject, setSubject] = useState('');
    const [activity, setActivity] = useState('');
    const [dateTime, setDateTime] = useState('');

    const handleSubjectSelect = (selectedSubject) => {
        setSubject(selectedSubject);
        setStep(2);
    };

    const handleActivitySelect = (selectedActivity) => {
        setActivity(selectedActivity);
        setStep(3);
    };

    const handleSchedule = async () => {
        if (!dateTime) {
            alert('Please select a date and time.');
            return;
        }

        try {
            const taskRef = await addDoc(collection(db, 'tasks'), {
                subject,
                activity,
                dateTime: new Date(dateTime), // Store as a Date object
                reminderSent: false, // Indicates if reminder was displayed
            });
            alert('Task scheduled successfully!');
            onTaskScheduled(); // Notify parent to check for tasks
            setStep(1);
            setSubject('');
            setActivity('');
            setDateTime('');
        } catch (error) {
            console.error('Error scheduling activity:', error);
        }
    };

    return (
        <div>
            {step === 1 && (
                <>
                    <p>Bot: Bạn muốn học bộ môn nào?</p>
                    <button onClick={() => handleSubjectSelect('Lịch Sử')}>Lịch Sử</button>
                    <button onClick={() => handleSubjectSelect('Giáo Dục địa phương')}>Giáo Dục địa phương</button>
                </>
            )}

            {step === 2 && (
                <>
                    <p>Bot: Bạn muốn làm gì?</p>
                    {subject === 'Lịch Sử' ? (
                        <>
                            <button onClick={() => handleActivitySelect('Học Flashcard')}>Học Flashcard</button>
                            <button onClick={() => handleActivitySelect('Học elearning')}>Học elearning</button>
                            <button onClick={() => handleActivitySelect('Làm Quiz')}>Làm Quiz</button>
                            <button onClick={() => handleActivitySelect('Viết Blog')}>Viết Blog</button>
                            <button onClick={() => handleActivitySelect('Làm luyện tập')}>Làm luyện tập</button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => handleActivitySelect('Học thông tin tỉnh thành')}>
                                Học thông tin tỉnh thành
                            </button>
                            <button onClick={() => handleActivitySelect('Học elearning')}>Học elearning</button>
                            <button onClick={() => handleActivitySelect('Viết Blog')}>Viết Blog</button>
                            <button onClick={() => handleActivitySelect('Làm Quiz')}>Làm Quiz</button>
                            <button onClick={() => handleActivitySelect('Làm luyện tập')}>Làm luyện tập</button>
                        </>
                    )}
                </>
            )}

            {step === 3 && (
                <>
                    <p>Bot: Chọn ngày và giờ bạn muốn học</p>
                    <input type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} />
                    <button onClick={handleSchedule}>Lưu nhiệm vụ</button>
                </>
            )}
        </div>
    );
};

export default StudyBot;
