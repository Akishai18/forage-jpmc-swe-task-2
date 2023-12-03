import React, { Component } from 'react';
import { Table } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void;
}

class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return <perspective-viewer />;
  }

  componentDidMount() {
    const elem: PerspectiveViewerElement = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
      stock: 'string',
      top_ask_price: 'float',
      top_bid_price: 'float',
      timestamp: 'date',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }

    if (this.table) {
      elem.load(this.table);
    }
  }

  componentDidUpdate() {
    if (this.table) {
      // Update the way we update the data to avoid inserting duplicated entries
      const uniqueData = Array.from(new Set(this.props.data.map(el => el.timestamp)))
        .map(timestamp => {
          const filteredData = this.props.data.filter(el => el.timestamp === timestamp);
          const averageTopAsk = filteredData.reduce((sum, el) => sum + (el.top_ask?.price || 0), 0) / filteredData.length;
          const averageTopBid = filteredData.reduce((sum, el) => sum + (el.top_bid?.price || 0), 0) / filteredData.length;

          return {
            stock: filteredData[0].stock,
            top_ask_price: averageTopAsk,
            top_bid_price: averageTopBid,
            timestamp,
          };
        });

      this.table.update(uniqueData);
    }
  }
}

export default Graph;

