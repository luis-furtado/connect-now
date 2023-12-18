import React, { useEffect, useRef } from "react";

export const VideoPlayer = ({ user }) => {
  const ref = useRef();

  useEffect(() => {
    user.videoTrack.play(ref.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      Uid: {user.uid}
      <div ref={ref} style={{ width: "200px", height: "200px" }}></div>
    </div>
  );
};
