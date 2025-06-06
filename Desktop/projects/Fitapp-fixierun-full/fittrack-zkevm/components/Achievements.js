import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Progress, Badge, Typography, Button, Modal, Tag, Spin } from 'antd';
import { TrophyOutlined, FireOutlined, ThunderboltOutlined, ClockCircleOutlined, AimOutlined, CalendarOutlined, StarOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

// Achievement definitions with metadata
const ACHIEVEMENTS = [
  {
    id: 'first_workout',
    title: 'First Steps',
    description: 'Complete your first workout session',
    icon: <TrophyOutlined />,
    requirement: 1,
    type: 'workout_count',
    color: '#1890ff',
  },
  {
    id: 'step_master',
    title: 'Step Master',
    description: 'Reach 10,000 lifetime steps',
    icon: <ThunderboltOutlined />,
    requirement: 10000,
    type: 'lifetime_steps',
    color: '#52c41a',
  },
  {
    id: 'consistent',
    title: 'Consistency King',
    description: 'Work out 7 days in a row',
    icon: <FireOutlined />,
    requirement: 7,
    type: 'streak_days',
    color: '#fa8c16',
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Complete 5 workouts before 7 AM',
    icon: <ClockCircleOutlined />,
    requirement: 5,
    type: 'morning_workouts',
    color: '#13c2c2',
  },
  {
    id: 'goal_setter',
    title: 'Goal Setter',
    description: 'Achieve your daily step goal 10 times',
    icon: <AimOutlined />,
    requirement: 10,
    type: 'goals_achieved',
    color: '#722ed1',
  },
  {
    id: 'monthly_champion',
    title: 'Monthly Champion',
    description: 'Complete 20 workouts in a single month',
    icon: <CalendarOutlined />,
    requirement: 20,
    type: 'monthly_workouts',
    color: '#eb2f96',
  },
  {
    id: 'fitness_master',
    title: 'Fitness Master',
    description: 'Earn all other achievements',
    icon: <StarOutlined />,
    requirement: 6, // Number of other achievements
    type: 'total_achievements',
    color: '#faad14',
  },
];

const AchievementCard = ({ achievement, progress, isUnlocked, isNew, onClick }) => {
  const progressPercent = Math.min(Math.round((progress / achievement.requirement) * 100), 100);
  
  return (
    <Badge.Ribbon
      text={isUnlocked ? "Unlocked!" : `${progressPercent}%`}
      color={isUnlocked ? "gold" : "blue"}
    >
      <Card
        hoverable
        onClick={() => onClick(achievement)}
        className={`achievement-card ${isUnlocked ? 'unlocked' : ''} ${isNew ? 'new-achievement' : ''}`}
        style={{
          marginBottom: 16,
          borderColor: isUnlocked ? achievement.color : '#d9d9d9',
          transition: 'all 0.3s',
          position: 'relative',
          opacity: isUnlocked ? 1 : 0.7,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              borderRadius: '50%',
              backgroundColor: isUnlocked ? achievement.color : '#f0f0f0',
              color: isUnlocked ? 'white' : '#999',
              width: 60,
              height: 60,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              margin: '0 auto 12px',
              fontSize: 24,
            }}
          >
            {achievement.icon}
          </div>
          <Title level={5} style={{ marginTop: 0, marginBottom: 4 }}>
            {achievement.title}
          </Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 12, height: 40, fontSize: 12 }}>
            {achievement.description}
          </Text>
          <Progress
            percent={progressPercent}
            size="small"
            strokeColor={achievement.color}
            style={{ width: '100%' }}
          />
          <Text style={{ display: 'block', fontSize: 12, marginTop: 8 }}>
            {progress} / {achievement.requirement}
          </Text>
        </div>
      </Card>
    </Badge.Ribbon>
  );
};

const Achievements = ({ userData = {}, onAchievementUnlocked, loading = false }) => {
  const [achievements, setAchievements] = useState([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  // Calculate achievement progress based on user data
  useEffect(() => {
    if (loading) return;
    
    const calculatedAchievements = ACHIEVEMENTS.map(achievement => {
      let progress = 0;
      
      // Calculate progress based on achievement type and user data
      switch (achievement.type) {
        case 'workout_count':
          progress = userData.workouts?.length || 0;
          break;
        case 'lifetime_steps':
          progress = userData.totalSteps || 0;
          break;
        case 'streak_days':
          progress = userData.currentStreak || 0;
          break;
        case 'morning_workouts':
          progress = userData.morningWorkouts || 0;
          break;
        case 'goals_achieved':
          progress = userData.goalsMet || 0;
          break;
        case 'monthly_workouts':
          progress = userData.monthlyWorkouts || 0;
          break;
        case 'total_achievements':
          // Count how many other achievements have been unlocked
          const otherAchievementsUnlocked = achievements
            .filter(a => a.id !== achievement.id && a.isUnlocked)
            .length;
          progress = otherAchievementsUnlocked;
          break;
        default:
          progress = 0;
      }

      const isUnlocked = progress >= achievement.requirement;

      return {
        ...achievement,
        progress,
        isUnlocked,
      };
    });

    setAchievements(calculatedAchievements);
  }, [userData, loading]);

  // Check for newly unlocked achievements
  useEffect(() => {
    const unlockedIds = achievements
      .filter(a => a.isUnlocked)
      .map(a => a.id);

    const previouslyUnlocked = userData.unlockedAchievements || [];
    const newUnlocked = unlockedIds.filter(id => !previouslyUnlocked.includes(id));

    if (newUnlocked.length > 0) {
      setNewlyUnlocked(newUnlocked);
      
      // Notify parent component about newly unlocked achievements
      if (onAchievementUnlocked) {
        newUnlocked.forEach(id => {
          const achievement = achievements.find(a => a.id === id);
          if (achievement) {
            onAchievementUnlocked(achievement);
          }
        });
      }
    }
  }, [achievements, userData, onAchievementUnlocked]);

  const handleAchievementClick = (achievement) => {
    setSelectedAchievement(achievement);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Spin size="large" />
        <Text style={{ display: 'block', marginTop: 16 }}>Loading achievements...</Text>
      </div>
    );
  }

  return (
    <div className="achievements-container">
      <Card 
        title={<Title level={4}>Achievements</Title>}
        extra={<Text>{achievements.filter(a => a.isUnlocked).length} of {achievements.length} unlocked</Text>}
        style={{ marginBottom: 20 }}
      >
        <Row gutter={[16, 16]}>
          {achievements.map(achievement => (
            <Col xs={24} sm={12} md={8} lg={6} key={achievement.id}>
              <AchievementCard
                achievement={achievement}
                progress={achievement.progress}
                isUnlocked={achievement.isUnlocked}
                isNew={newlyUnlocked.includes(achievement.id)}
                onClick={handleAchievementClick}
              />
            </Col>
          ))}
        </Row>
      </Card>

      <Modal
        title={<Text strong>{selectedAchievement?.title || 'Achievement Details'}</Text>}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>,
          selectedAchievement?.isUnlocked && (
            <Button 
              key="share" 
              type="primary"
              onClick={() => {
                // Handle sharing achievement
                setModalVisible(false);
              }}
            >
              Share Achievement
            </Button>
          )
        ]}
      >
        {selectedAchievement && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                borderRadius: '50%',
                backgroundColor: selectedAchievement.color,
                color: 'white',
                width: 80,
                height: 80,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: '0 auto 20px',
                fontSize: 32,
              }}
            >
              {selectedAchievement.icon}
            </div>
            <Title level={4}>{selectedAchievement.title}</Title>
            <Text>{selectedAchievement.description}</Text>
            
            <div style={{ margin: '20px 0' }}>
              <Progress
                percent={Math.min(Math.round((selectedAchievement.progress / selectedAchievement.requirement) * 100), 100)}
                strokeColor={selectedAchievement.color}
              />
              <Text>
                Progress: {selectedAchievement.progress} / {selectedAchievement.requirement}
              </Text>
            </div>
            
            {selectedAchievement.isUnlocked ? (
              <Tag color="gold" style={{ padding: '4px 8px', fontSize: 16 }}>
                Unlocked!
              </Tag>
            ) : (
              <Text type="secondary">
                Keep going! You're making progress toward this achievement.
              </Text>
            )}
          </div>
        )}
      </Modal>
      
      <style jsx global>{`
        .new-achievement {
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(250, 173, 20, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(250, 173, 20, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(250, 173, 20, 0);
          }
        }

        .unlocked .ant-card-body {
          background-color: rgba(255, 255, 235, 0.3);
        }
      `}</style>
    </div>
  );
};

export default Achievements;

