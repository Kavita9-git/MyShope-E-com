import React from 'react';
import NotificationManager from '../../components/NotificationManager';
import Layout from '../../components/Layout/Layout';

const Notifications = ({ navigation }) => {
  return (
    <Layout showBackButton={true}>
      <NotificationManager navigation={navigation} />
    </Layout>
  );
};

export default Notifications;
