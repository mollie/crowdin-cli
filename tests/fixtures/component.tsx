import React from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';

const messages = defineMessages({
  title: {
    id: 'mollie-crowdin-title',
    defaultMessage: 'Hi!',
    description: 'Title',
  },
  content: {
    id: 'mollie-crowdin-content',
    defaultMessage: 'This is a test',
  },
});

export default class Fixture extends React.Component<{}, {}> {
  render() {
    return (
      <div>
        <h1>
          <FormattedMessage {...messages.title} />
        </h1>
        <span>
          <FormattedMessage {...messages.content} />
        </span>
      </div>
    );
  }
};

